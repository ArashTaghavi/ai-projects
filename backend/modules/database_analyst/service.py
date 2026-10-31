from typing import Callable

from modules.database_analyst.rag.rag import DatabaseAnalyst


class DatabaseAnalystService:
    def __init__(self) -> None:
        pass

    def ask(self, query: str, on_progress: Callable[[str], None] | None = None):
        rag = DatabaseAnalyst(on_progress=on_progress)

        return rag.generate_answer(query=query, on_progress=on_progress)
