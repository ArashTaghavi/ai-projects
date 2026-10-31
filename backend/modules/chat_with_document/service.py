import logging
from hashlib import blake2b
from pathlib import Path
from uuid import uuid4

from core import config as _environment_config
from database.connection import DbSession, SessionLocal
from database.models import Document, DocumentChatTurn
from fastapi import HTTPException, UploadFile
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from sqlalchemy import select, text
from starlette.concurrency import run_in_threadpool

from .rag.rag import EmptyDocumentError, get_chat_with_document


class ChatService:

    def documents(self, db: DbSession, owner_id: int) -> list[Document]:
        statement = (
            select(Document)
            .where(Document.owner_id == owner_id)
            .order_by(Document.created_at.desc(), Document.id.desc())
        )
        return list(db.scalars(statement).all())

    @staticmethod
    def require_document(db: DbSession, document_id: str, owner_id: int) -> Document:
        document = db.scalar(
            select(Document).where(Document.id == document_id, Document.owner_id == owner_id)
        )
        if document is None:
            raise HTTPException(status_code=404, detail="Document not found.")
        return document

    def ask(
        self, db: DbSession, query: str, document_id: str, owner_id: int
    ) -> str | None:
        # Step 1: Initialize the RAG service
        rag = get_chat_with_document()

        try:
            self.require_document(db, document_id, owner_id)
            # Step 2: Lock the conversation to prevent concurrent requests
            self._lock_conversation(db, owner_id, document_id)

            # Step 3: Retrieve conversation history and convert it to LangChain messages
            history = self._as_messages(
                self._get_document_chat_history(db, owner_id, document_id)
            )

            # Step 4: Generate an answer using RAG and conversation history
            answer = rag.generate_answer(
                query=query,
                document_id=document_id,
                owner_id=owner_id,
                chat_history=history,
            )

            # Step 5: Save the question and answer if generation succeeds
            if answer is not None:
                db.add(
                    DocumentChatTurn(
                        owner_id=owner_id,
                        document_id=document_id,
                        question=query,
                        answer=answer,
                    )
                )

            # Step 6: Commit the transaction and release the conversation lock
            db.commit()

            # Step 7: Return the generated answer
            return answer

        except Exception:
            db.rollback()
            raise

    def history(
        self,
        db: DbSession,
        document_id: str,
        owner_id: int,
    ) -> list[DocumentChatTurn]:
        self.require_document(db, document_id, owner_id)
        return self._get_document_chat_history(db, owner_id, document_id)

    async def upload(self, file: UploadFile, owner_id: int, name: str):
        name = name.strip()
        if not name or len(name) > 255:
            raise HTTPException(status_code=422, detail="Document name must contain 1 to 255 characters.")
        if not file.filename or Path(file.filename).suffix.lower() != ".docx":
            raise HTTPException(
                status_code=400,
                detail="Only DOCX files are allowed.",
            )

        storage_path = Path(__file__).resolve().parent / "storage" / "documents"
        storage_path.mkdir(parents=True, exist_ok=True)

        document_id = uuid4().hex
        filename = f"{document_id}.docx"
        file_path = storage_path / filename

        try:
            ids = await run_in_threadpool(
                self._save_and_ingest, file, file_path, document_id, owner_id, name
            )
        except EmptyDocumentError as exc:
            file_path.unlink(missing_ok=True)
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        except Exception:
            file_path.unlink(missing_ok=True)
            raise
        finally:
            await file.close()

        return {
            "document_id": document_id,
            "name": name,
            "original_filename": file.filename,
            "chunks_count": len(ids),
            "message": "Document uploaded and indexed successfully.",
        }

    @staticmethod
    def _save_and_ingest(
        file: UploadFile, file_path: Path, document_id: str, owner_id: int, name: str
    ) -> list[str]:
        # Every upload receives a new ID; a chat's document is never replaced here.
        with file_path.open("wb") as destination:
            while chunk := file.file.read(1024 * 1024):
                destination.write(chunk)

        rag = get_chat_with_document()
        ids = []
        # Create and use the session entirely in the upload worker thread.
        with SessionLocal() as db:
            try:
                db.add(Document(
                    id=document_id,
                    owner_id=owner_id,
                    name=name,
                    original_file_name=file.filename,
                ))
                db.flush()
                ids = rag.ingest(file_path=file_path, document_id=document_id, owner_id=owner_id)
                db.commit()
                return ids
            except Exception:
                db.rollback()
                if ids:
                    try:
                        rag.vector_store.delete(ids=ids)
                    except Exception:
                        logging.getLogger(__name__).exception(
                            "Could not clean up embeddings for document %s", document_id
                        )
                raise

    @staticmethod
    def _lock_conversation(db: DbSession, owner_id: int, document_id: str) -> None:
        # Generate a unique lock key for the conversation
        key = int.from_bytes(
            blake2b(
                f"{owner_id}:{document_id}".encode(),
                digest_size=8,
            ).digest(),
            byteorder="big",
            signed=True,
        )

        # Lock the conversation until the transaction ends
        db.execute(
            text("SELECT pg_advisory_xact_lock(:key)"),
            {"key": key},
        )

    @staticmethod
    def _get_document_chat_history(
        db: DbSession,
        owner_id: int,
        document_id: str,
    ) -> list[DocumentChatTurn]:
        statement = (
            select(DocumentChatTurn)
            .where(
                DocumentChatTurn.owner_id == owner_id,
                DocumentChatTurn.document_id == document_id,
            )
            .order_by(DocumentChatTurn.id.asc())
        )

        return list(db.scalars(statement).all())

    @staticmethod
    def _as_messages(
        turns: list[DocumentChatTurn],
    ) -> list[BaseMessage]:
        messages: list[BaseMessage] = []

        for turn in turns:
            messages.extend(
                [
                    HumanMessage(content=turn.question),
                    AIMessage(content=turn.answer),
                ]
            )

        return messages
