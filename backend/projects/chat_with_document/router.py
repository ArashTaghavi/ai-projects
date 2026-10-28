from fastapi import APIRouter, File, UploadFile

from .schema import AskRequest
from .service import ChatService

router = APIRouter(
    prefix="/chat-with-document",
    tags=["Chat with Document"],
)

service = ChatService()


@router.post("/ask")
def ask(request: AskRequest):
    return {
        "answer": service.ask(
            query=request.query,
            document_id=request.document_id,
        )
    }


@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    return await service.upload(file)
