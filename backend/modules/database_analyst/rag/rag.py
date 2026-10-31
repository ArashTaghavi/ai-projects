from pathlib import Path
from typing import Callable, cast

from langchain.chat_models import init_chat_model
from langchain_community.utilities import SQLDatabase
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from sqlalchemy.exc import SQLAlchemyError


class SQLResponse(BaseModel):
    sql: str = Field(description="The generated SQLite SQL query")
    text: str = Field(
        description="A brief explanation of the SQL query in the same language as the user's question"
    )


class SQLRefinement(BaseModel):
    needs_refinement: bool = Field(
        description="Whether the original SQL needs to be corrected"
    )
    feedback: str = Field(
        description="A brief review in the same language as the user's question"
    )
    refined_sql: str = Field(
        description="The corrected SQLite SQL query, or the original SQL if no correction is needed"
    )


class DatabaseAnalyst:
    def __init__(self, on_progress: Callable[[str], None] | None = None) -> None:
        # Step-1: Connect to SQLite database
        if on_progress:
            on_progress("connecting")
        database_path = Path(__file__).resolve().parent / "db.sqlite"

        self.db = SQLDatabase.from_uri(
            f"sqlite:///{database_path.as_posix()}",
            sample_rows_in_table_info=0,
        )

        # Step-2: Read database schema
        if on_progress:
            on_progress("reading_schema")
        self.schema = self.db.get_table_info()

        # Step-3: Initialize LLM
        if on_progress:
            on_progress("preparing_model")
        self.llm = init_chat_model(
            model="gpt-4o-mini",
            model_provider="openai",
            temperature=0,
        )

        # Step-4: Create generation prompt
        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
You are a strict SQLite SQL assistant.

Generate a valid SQLite SELECT query based on the user's question.

Database schema:
{schema}

STRICT RULES:
1. Use ONLY tables explicitly defined in the provided schema.
2. Use ONLY columns that actually exist in those tables.
3. NEVER invent tables, columns, or relationships.
4. Use JOINs only when the required tables and columns exist.
5. Do not assume the existence of any database objects not listed in the schema.
6. If the question cannot be answered using the provided schema, do not fabricate a query.
7. Generate a brief explanation of the SQL query.
8. Write the explanation in the same language as the user's question.
                    """,
                ),
                ("human", "{question}"),
            ]
        )

        # Step-5: Create generation chain
        self.chain = self.prompt | self.llm.with_structured_output(SQLResponse)

        # Step-6: Create refinement prompt
        self.refinement_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
You are a strict SQLite SQL reviewer and refiner.

Review the generated SQL using the user's question,
the database schema, and the actual execution result or error.

Database schema:
{schema}

STRICT RULES:
1. Verify that EVERY referenced table exists in the provided schema.
2. Verify that EVERY referenced column exists in its corresponding table.
3. NEVER invent tables, columns, or relationships.
4. Check whether the SQL correctly answers the user's question.
5. If the SQL references nonexistent tables or columns, correct it using ONLY the provided schema.
6. If execution failed, analyze the error and correct the SQL.
7. If the SQL is already correct, return it unchanged.
8. An empty result does not necessarily indicate an incorrect query.
9. Only generate valid SQLite SELECT queries.
10. Do not assume any database structure beyond the provided schema.
11. Write feedback in the same language as the user's question.
                    """,
                ),
                (
                    "human",
                    """
User question:
{question}

Generated SQL:
{sql}

Execution result or error:
{result}
                    """,
                ),
            ]
        )

        # Step-7: Create refinement chain
        self.refinement_chain = (
            self.refinement_prompt | self.llm.with_structured_output(SQLRefinement)
        )

    def generate_sql(self, question: str) -> SQLResponse:
        return cast(
            SQLResponse,
            self.chain.invoke(
                {
                    "question": question,
                    "schema": self.schema,
                }
            ),
        )

    def execute_sql(self, sql: str) -> tuple[str, bool]:
        try:
            result = self.db.run(sql, include_columns=True)
            return result, True
        except SQLAlchemyError as exc:
            return str(exc), False

    def refine_sql(
        self,
        question: str,
        sql: str,
        result: str,
    ) -> SQLRefinement:
        return cast(
            SQLRefinement,
            self.refinement_chain.invoke(
                {
                    "question": question,
                    "schema": self.schema,
                    "sql": sql,
                    "result": result,
                }
            ),
        )

    def generate_answer(
        self, query: str, on_progress: Callable[[str], None] | None = None
    ):
        # Step-1: Generate SQL
        if on_progress:
            on_progress("generating_sql")
        response = self.generate_sql(query)

        # Step-2: Execute SQL
        if on_progress:
            on_progress("executing_sql")
        result, success = self.execute_sql(response.sql)

        # Step-3: Review and refine SQL
        if on_progress:
            on_progress("reviewing_sql")
        refinement = self.refine_sql(
            question=query,
            sql=response.sql,
            result=result if success else f"SQL execution error: {result}",
        )

        # Step-4: Execute refined SQL if needed
        final_sql = response.sql

        if refinement.needs_refinement:
            if on_progress:
                on_progress("executing_refined_sql")
            final_sql = refinement.refined_sql
            result, success = self.execute_sql(final_sql)

        # Step-5: Return final response
        return {
            "initial_sql": response.sql,
            "sql": final_sql,
            "text": response.text,
            "result": result,
            "success": success,
            "refined": refinement.needs_refinement,
            "feedback": refinement.feedback,
        }
