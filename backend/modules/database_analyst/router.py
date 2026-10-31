import logging

from anyio import from_thread
from core.modules.auth.dependencies import CurrentUser
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from starlette.concurrency import run_in_threadpool

from .service import DatabaseAnalystService

router = APIRouter(
    prefix="/database-analyst",
    tags=["Database Analyst"],
)

service = DatabaseAnalystService()


class AskRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    query: str = Field(min_length=1)


class AnswerResponse(BaseModel):
    initial_sql: str
    sql: str
    text: str
    result: str
    success: bool
    refined: bool
    feedback: str


PROGRESS_MESSAGES = {
    "connecting": "در حال اتصال به دیتابیس…",
    "reading_schema": "در حال بررسی ساختار جدول‌ها…",
    "preparing_model": "در حال آماده‌سازی مدل…",
    "generating_sql": "در حال تحلیل سؤال و تولید SQL…",
    "executing_sql": "در حال اجرای SQL…",
    "reviewing_sql": "در حال بررسی مجدد SQL و نتیجهٔ اجرا…",
    "executing_refined_sql": "در حال اجرای SQL اصلاح‌شده…",
}


@router.websocket("/ws")
async def stream_answer(websocket: WebSocket, current_user: CurrentUser):
    await websocket.accept()
    try:
        try:
            request = AskRequest.model_validate(await websocket.receive_json())
        except (ValidationError, ValueError):
            await websocket.send_json({"type": "error", "data": {"message": "سؤال معتبر وارد کنید."}})
            return

        def report(stage: str):
            from_thread.run(websocket.send_json, {
                "type": "progress",
                "data": {"stage": stage, "message": PROGRESS_MESSAGES[stage]},
            })

        answer = await run_in_threadpool(service.ask, request.query, report)
        result = AnswerResponse.model_validate(answer)
        await websocket.send_json({"type": "result", "data": result.model_dump()})
    except WebSocketDisconnect:
        return
    except Exception:
        logging.getLogger(__name__).exception("Database analyst request failed")
        try:
            await websocket.send_json({"type": "error", "data": {"message": "پردازش سؤال انجام نشد. دوباره تلاش کنید."}})
        except (WebSocketDisconnect, RuntimeError):
            return
    finally:
        try:
            await websocket.close()
        except (WebSocketDisconnect, RuntimeError):
            pass


@router.post("/ask", response_model=AnswerResponse)
def ask(request: AskRequest, current_user: CurrentUser):
    return service.ask(query=request.query)


@router.post("/documents")
def documents(query: str, current_user: CurrentUser):
    return service.ask(query=query)
