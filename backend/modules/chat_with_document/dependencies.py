from core.modules.auth import CurrentUser
from database.connection import DbSession
from fastapi import Depends, HTTPException
from database.models import Document
from sqlalchemy import select

from .schema import AskRequest


def verify_document_access(
    request: AskRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    document = db.scalar(
        select(Document.id).where(
            Document.id == request.document_id,
            Document.owner_id == current_user.id,
        )
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )


VerifyDocumentAccess = Depends(verify_document_access)
