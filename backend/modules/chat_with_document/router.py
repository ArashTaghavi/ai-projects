from typing import Annotated

from core.modules.auth.dependencies import CurrentUser
from database.connection import DbSession
from fastapi import APIRouter, File, Form, Query, UploadFile

from .dependencies import VerifyDocumentAccess
from .schema import AskRequest, ChatTurnResponse, DocumentName, DocumentResponse
from .service import ChatService

router = APIRouter(
    prefix="/chat-with-document",
    tags=["Chat with Document"],
)

service = ChatService()


@router.get("/documents", response_model=list[DocumentResponse])
def documents(db: DbSession, current_user: CurrentUser):
    return service.documents(db=db, owner_id=current_user.id)


@router.get("/documents/{document_id}", response_model=DocumentResponse)
def document(document_id: str, db: DbSession, current_user: CurrentUser):
    return service.require_document(db=db, document_id=document_id, owner_id=current_user.id)


@router.post("/ask", dependencies=[VerifyDocumentAccess])
def ask(request: AskRequest, db: DbSession, current_user: CurrentUser):
    return {
        "answer": service.ask(
            db=db,
            query=request.query,
            document_id=request.document_id,
            owner_id=current_user.id,
        )
    }


@router.post("/upload")
async def upload(current_user: CurrentUser, file: Annotated[UploadFile, File()], name: Annotated[DocumentName, Form()]):
    return await service.upload(
        file=file,
        owner_id=current_user.id,
        name=name,
    )


@router.get("/history", response_model=list[ChatTurnResponse])
def history(
    db: DbSession,
    current_user: CurrentUser,
    document_id: str = Query(min_length=1),
):
    return service.history(
        db=db,
        document_id=document_id,
        owner_id=current_user.id,
    )
