from modules.database_analyst.rag.rag import DatabaseAnalyst


class DatabaseAnalystService:
    def __init__(self) -> None:
        pass

    def ask(self, query: str):
        rag = DatabaseAnalyst()

        return rag.generate_answer(query=query)
