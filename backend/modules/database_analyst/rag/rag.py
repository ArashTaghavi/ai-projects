from pathlib import Path
from typing import cast

from langchain.chat_models import init_chat_model
from langchain_community.utilities import SQLDatabase
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field


class SQLResponse(BaseModel):
    sql: str = Field(description="The generated SQLite SQL query")
    text: str = Field(
        description="A brief explanation of the SQL query in the same language as the user's question"
    )


class DatabaseAnalyst:
    def __init__(self) -> None:
        # Step-1: Connect to SQLite database
        database_path = Path(__file__).resolve().parent / "db.sqlite"

        self.db = SQLDatabase.from_uri(
            f"sqlite:///{database_path.as_posix()}",
            sample_rows_in_table_info=0,
        )

        # Step-2: Read database schema
        self.schema = self.db.get_table_info()

        # Step-3: Initialize LLM
        self.llm = init_chat_model(
            model="gpt-4o-mini",
            model_provider="openai",
            temperature=0,
        )

        # Step-4: Create prompt
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
You are a SQL assistant.
Given the database schema and the user's question,
generate a valid SQLite query.

Database schema:
{schema}

Generate a SQL query and a brief explanation of what it does.
Write the explanation in the same language as the user's question.
    """,
                ),
                ("human", "{question}"),
            ]
        )

        # Step-5: Create structured output chain
        self.chain = self.prompt | self.llm.with_structured_output(SQLResponse)

    def generate_answer(self, query: str):
        response = cast(
            SQLResponse,
            self.chain.invoke(
                {
                    "question": query,
                    "schema": self.schema,
                }
            ),
        )

        result = self.db.run(response.sql, include_columns=True)

        return {
            "sql": response.sql,
            "text": response.text,
            "result": result,
        }
