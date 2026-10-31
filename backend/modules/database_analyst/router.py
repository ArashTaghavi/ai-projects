from core.modules.auth.dependencies import CurrentUser
from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

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
    sql: str
    text: str
    result: str


@router.post("/ask", response_model=AnswerResponse)
def ask(request: AskRequest, current_user: CurrentUser):
    return service.ask(query=request.query)


@router.post("/documents")
def documents(query: str, current_user: CurrentUser):
    return service.ask(query=query)
