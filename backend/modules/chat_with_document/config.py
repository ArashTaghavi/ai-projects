# LLM
MODEL_NAME = "gpt-4o-mini"
MODEL_PROVIDER = "openai"
TEMPERATURE = 0.0

# Embeddings
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_LENGTH = 1536

# Vector Store
COLLECTION_NAME = "chat_documents"
RETRIEVAL_K = 4

# Document Splitting
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# Chat History
HISTORY_TURNS = 20

# Prompts
SYSTEM_PROMPT = """
You are a document question-answering assistant.

Answer the user's question using only the provided context.
Do not use external knowledge.

If the context does not contain enough information,
say that the answer was not found in the document.

Use the conversation history to understand follow-up questions,
but base your answers only on the provided document context.

Respond in the same language as the user's question.

Context:
{context}
"""

REWRITE_PROMPT = """
Given the conversation history and the latest user question,
rewrite the question into a standalone question that can be
understood without the conversation history.

Do not answer the question.
Do not add information that was not present in the conversation.
Preserve the original language.

If the question is already standalone, return it unchanged.

Return only the rewritten question.
"""
