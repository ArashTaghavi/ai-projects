from langchain.chat_models import init_chat_model
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

from ..config import (
    MODEL_NAME,
    MODEL_PROVIDER,
    RETRIEVAL_K,
    SYSTEM_PROMPT,
    TEMPERATURE,
)
from .vector_store import get_vector_store


def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


def generate_answer(query: str, document_id: str) -> str:
    vector_store = get_vector_store()

    retriever = vector_store.as_retriever(
        search_kwargs={
            "k": RETRIEVAL_K,
            "filter": {"document_id": document_id},
        }
    )

    llm = init_chat_model(
        model=MODEL_NAME,
        model_provider=MODEL_PROVIDER,
        temperature=TEMPERATURE,
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            ("human", "{question}"),
        ]
    )

    chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain.invoke(query)
