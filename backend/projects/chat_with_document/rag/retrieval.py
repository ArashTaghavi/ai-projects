from langchain_core.documents import Document

from .vector_store import get_vector_store


def retrieve_documents(
    query: str,
    document_id: str,
    k: int = 4,
) -> list[tuple[Document, float]]:
    vector_store = get_vector_store()

    return vector_store.similarity_search_with_relevance_scores(
        query=query,
        k=k,
        filter={"document_id": document_id},
    )
