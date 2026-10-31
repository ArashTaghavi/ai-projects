import os
from functools import lru_cache
from pathlib import Path
from shutil import copyfileobj
from uuid import uuid4

from core import config as _environment_config
from database.connection import DbSession
from fastapi import HTTPException, UploadFile
from langchain.chat_models import init_chat_model
from langchain_community.document_loaders import Docx2txtLoader
from langchain_core.documents import Document
from langchain_core.messages import BaseMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import OpenAIEmbeddings
from langchain_postgres.vectorstores import (
    DistanceStrategy,
    PGVector,
)
from langchain_text_splitters import RecursiveCharacterTextSplitter

from ..config import (
    CHUNK_OVERLAP,
    CHUNK_SIZE,
    COLLECTION_NAME,
    EMBEDDING_LENGTH,
    EMBEDDING_MODEL,
    MODEL_NAME,
    MODEL_PROVIDER,
    RETRIEVAL_K,
    REWRITE_PROMPT,
    SYSTEM_PROMPT,
    TEMPERATURE,
)
from ..models.document import Document as UploadedDocument


class ChatWithDocument:

    def __init__(self) -> None:
        self.vector_store: PGVector = self._create_vector_store()

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separators=["\n\n", "\n", " ", ""],
        )

        self.llm = init_chat_model(
            model=MODEL_NAME,
            model_provider=MODEL_PROVIDER,
            temperature=TEMPERATURE,
        )

        self.prompt = ChatPromptTemplate.from_messages(
            [
                ("system", SYSTEM_PROMPT),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{question}"),
            ]
        )

        self.chain = self.prompt | self.llm | StrOutputParser()

        self.rewrite_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", REWRITE_PROMPT),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{question}"),
            ]
        )

        self.rewrite_chain = self.rewrite_prompt | self.llm | StrOutputParser()

    @staticmethod
    def prepare_upload(
        db: DbSession, file: UploadFile, name: str, owner_id: int
    ) -> tuple[UploadedDocument, Path]:
        name = name.strip()
        if not name or len(name) > 255:
            raise HTTPException(
                status_code=422,
                detail="Document name must contain 1 to 255 characters.",
            )
        if not file.filename or Path(file.filename).suffix.lower() != ".docx":
            raise HTTPException(status_code=400, detail="Only DOCX files are allowed.")

        filename = f"{uuid4().hex}.docx"
        storage_path = Path(__file__).resolve().parent.parent / "storage" / "documents"
        storage_path.mkdir(parents=True, exist_ok=True)
        file_path = storage_path / filename
        with file_path.open("wb") as destination:
            copyfileobj(file.file, destination)

        document = UploadedDocument(
            owner_id=owner_id,
            name=name,
            original_file_name=file.filename,
        )
        db.add(document)
        db.flush()
        return document, file_path

    def _load_document(self, file_path: Path) -> list[Document]:
        loader = Docx2txtLoader(file_path=file_path)
        return loader.load()

    def _split_document(self, documents: list[Document]) -> list[Document]:
        return self.splitter.split_documents(documents=documents)

    def _create_vector_store(self) -> PGVector:
        embeddings = OpenAIEmbeddings(
            model=EMBEDDING_MODEL,
        )

        return PGVector(
            embeddings=embeddings,
            embedding_length=EMBEDDING_LENGTH,
            collection_name=COLLECTION_NAME,
            connection=os.environ["DATABASE_URL"],
            distance_strategy=DistanceStrategy.COSINE,
            collection_metadata={
                "description": "chat with document",
                "version": 1,
                "languages": "all",
            },
            use_jsonb=True,
            pre_delete_collection=False,
            create_extension=True,
        )

    def ingest(
        self,
        chunks: list[Document],
        document_id: int,
        owner_id: int,
    ) -> list[str]:

        if not chunks:
            raise EmptyDocumentError("Document contains no extractable text.")

        ids = []

        for index, chunk in enumerate(chunks):
            chunk.metadata.update(
                {
                    "document_id": document_id,
                    "owner_id": owner_id,
                    "chunk_index": index,
                }
            )

            ids.append(f"{owner_id}:{document_id}:{index}")

        return self.vector_store.add_documents(
            documents=chunks,
            ids=ids,
        )

    def retrieve_documents(
        self,
        query: str,
        document_id: int,
        owner_id: int,
        k: int = RETRIEVAL_K,
    ) -> list[Document]:

        return self.vector_store.similarity_search(
            query=query,
            k=k,
            filter={
                "document_id": document_id,
                "owner_id": owner_id,
            },
        )

    def _rewrite_query(
        self,
        query: str,
        chat_history: list[BaseMessage],
    ) -> str:

        if not chat_history:
            return query

        return self.rewrite_chain.invoke(
            {
                "question": query,
                "chat_history": chat_history,
            }
        )

    def generate_answer(
        self,
        query: str,
        document_id: int,
        owner_id: int,
        chat_history: list[BaseMessage],
    ) -> str | None:

        standalone_query = self._rewrite_query(
            query=query,
            chat_history=chat_history,
        )

        documents = self.retrieve_documents(
            query=standalone_query,
            document_id=document_id,
            owner_id=owner_id,
        )

        if not documents:
            return None

        return self.chain.invoke(
            {
                "question": query,
                "context": format_docs(documents),
                "chat_history": chat_history,
            }
        )


class EmptyDocumentError(ValueError):
    """The document has no text that can be indexed."""


def format_docs(docs: list[Document]) -> str:
    return "\n\n".join(doc.page_content for doc in docs)


@lru_cache(maxsize=1)
def get_chat_with_document() -> ChatWithDocument:
    return ChatWithDocument()
