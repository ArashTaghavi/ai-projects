import os

from core import config
from langchain_openai import OpenAIEmbeddings
from langchain_postgres import PGVector


def get_vector_store() -> PGVector:
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
    )

    return PGVector(
        embeddings=embeddings,
        collection_name="chat_documents",
        connection=os.environ["DATABASE_URL"],
        use_jsonb=True,
    )
