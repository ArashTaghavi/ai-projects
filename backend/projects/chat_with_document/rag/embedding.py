from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings


def embed_documents(documents: list[Document]) -> list[list[float]]:
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
    )

    texts = [document.page_content for document in documents]

    return embeddings.embed_documents(texts)
