from datetime import datetime

from database.models.base import BaseModel
from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship


class DocumentChatTurn(BaseModel):
    __tablename__ = "document_chat_turns"
    __table_args__ = (
        Index("ix_document_chat_turns_owner_document_id", "owner_id", "document_id", "id"),
    )

    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True)
    document_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("documents.id"),
        nullable=False,
        index=True,
    )
    owner_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Relations
    document: Mapped["Document"] = relationship(back_populates="chat_turns")
    owner: Mapped["User"] = relationship("User")
