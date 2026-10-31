from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

DocumentName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]


class AskRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    query: str = Field(min_length=1)
    document_id: int = Field(gt=0)


class ChatTurnResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question: str
    answer: str
    created_at: datetime


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    original_file_name: str
    created_at: datetime
    last_message_preview: str | None = None
    last_message_at: datetime | None = None
