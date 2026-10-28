from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from .rag.chunking import split_document
from .rag.generation import generate_answer
from .rag.loader import load_document
from .rag.vector_store import get_vector_store


class ChatService:

    def ask(self, query: str, document_id: str):
        return generate_answer(query=query, document_id=document_id)

    async def upload(self, file: UploadFile):
        if not file.filename or Path(file.filename).suffix.lower() != ".docx":
            raise HTTPException(
                status_code=400,
                detail="Only DOCX files are allowed.",
            )

        storage_path = Path(__file__).resolve().parent / "storage" / "documents"
        storage_path.mkdir(parents=True, exist_ok=True)

        filename = f"{uuid4().hex}.docx"
        file_path = storage_path / filename

        try:
            with file_path.open("wb") as destination:
                while chunk := await file.read(1024 * 1024):
                    destination.write(chunk)
        finally:
            await file.close()

        try:
            documents = load_document(file_path)
            chunks = split_document(documents)

            for chunk in chunks:
                chunk.metadata["document_id"] = filename
                chunk.metadata["original_filename"] = file.filename

            vector_store = get_vector_store()
            vector_store.add_documents(chunks)

        except Exception:
            file_path.unlink(missing_ok=True)
            raise

        return {
            "document_id": filename,
            "original_filename": file.filename,
            "chunks_count": len(chunks),
            "message": "Document uploaded and indexed successfully.",
        }
