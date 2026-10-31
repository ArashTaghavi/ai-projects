from hashlib import blake2b
from shutil import copyfileobj

from core import config as _environment_config
from database.connection import DbSession
from database.models import Document, DocumentChatTurn
from fastapi import HTTPException, UploadFile
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from sqlalchemy import select, text

from .rag.rag import ChatWithDocument, EmptyDocumentError, get_chat_with_document
from .schema import DocumentResponse


class ChatService:

    def documents(self, db: DbSession, owner_id: int) -> list[DocumentResponse]:
        latest_turn = (
            select(DocumentChatTurn.id)
            .where(
                DocumentChatTurn.document_id == Document.id,
                DocumentChatTurn.owner_id == owner_id,
            )
            .order_by(DocumentChatTurn.id.desc())
            .limit(1)
            .correlate(Document)
            .scalar_subquery()
        )
        statement = (
            select(Document, DocumentChatTurn)
            .outerjoin(DocumentChatTurn, DocumentChatTurn.id == latest_turn)
            .where(Document.owner_id == owner_id)
            .order_by(Document.created_at.desc(), Document.id.desc())
        )
        results = []
        for document, turn in db.execute(statement):
            response = DocumentResponse.model_validate(document)
            if turn:
                words = turn.answer.split()
                response.last_message_preview = " ".join(words[:6]) + (
                    "…" if len(words) > 6 else ""
                )
                response.last_message_at = turn.created_at
            results.append(response)
        return results

    @staticmethod
    def require_document(db: DbSession, document_id: int, owner_id: int) -> Document:
        document = db.scalar(
            select(Document).where(
                Document.id == document_id, Document.owner_id == owner_id
            )
        )
        if document is None:
            raise HTTPException(status_code=404, detail="Document not found.")
        return document

    def ask(
        self, db: DbSession, query: str, document_id: int, owner_id: int
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
        document_id: int,
        owner_id: int,
    ) -> list[DocumentChatTurn]:
        self.require_document(db, document_id, owner_id)
        return self._get_document_chat_history(db, owner_id, document_id)

    def upload(self, db: DbSession, file: UploadFile, owner_id: int, name: str):
        name, file_path = ChatWithDocument.prepare_upload(file, name)

        try:
            # Step-1: Upload file
            with file_path.open("wb") as destination:
                copyfileobj(file.file, destination)

            # Step-2: Create ChatWithDocument
            rag = ChatWithDocument()

            # Step-3: Load document text
            documents = rag._load_document(file_path=file_path)

            # Step-4: Split document into chunks
            chunks = rag._split_document(documents=documents)

            # Step-5: Save document in the database
            document = Document(
                owner_id=owner_id,
                name=name,
                original_file_name=file.filename,
            )
            db.add(document)
            db.flush()
            document_id = document.id

            # Step-6: Embed chunks and store vectors
            ids = rag.ingest(chunks=chunks, document_id=document_id, owner_id=owner_id)
            db.commit()
        except Exception as exc:
            db.rollback()
            if isinstance(exc, EmptyDocumentError):
                raise HTTPException(status_code=422, detail=str(exc)) from exc
            raise
        finally:
            file.file.close()

        return {
            "document_id": document_id,
            "name": name,
            "original_filename": file.filename,
            "chunks_count": len(ids),
            "message": "Document uploaded and indexed successfully.",
        }

    @staticmethod
    def _lock_conversation(db: DbSession, owner_id: int, document_id: int) -> None:
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
        document_id: int,
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
