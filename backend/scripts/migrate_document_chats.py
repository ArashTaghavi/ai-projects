"""Run from backend: .venv/Scripts/python scripts/migrate_document_chats.py.

Stop upload/chat workers while applying this PostgreSQL migration. Existing
document IDs are preserved so vector metadata and stored histories still match.
Original names of legacy uploads cannot be recovered; their IDs are used instead.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import inspect, select, text
from sqlalchemy.dialects.postgresql import insert

from database.connection import engine
from database.models import Document, DocumentChatTurn
from modules.chat_with_document.config import COLLECTION_NAME
from scripts.migrate_document_names import upgrade_document_names


def migrate():
    with engine.begin() as connection:
        if connection.dialect.name != "postgresql":
            raise RuntimeError("This migration requires PostgreSQL.")
        connection.execute(text("SELECT pg_advisory_xact_lock(742901663)"))
        if not inspect(connection).has_table("users"):
            raise RuntimeError("Create the existing users schema before this migration.")

        Document.__table__.create(connection, checkfirst=True)
        upgrade_document_names(connection)
        DocumentChatTurn.__table__.create(connection, checkfirst=True)
        # The old module model used VARCHAR(100); preserve all legacy IDs.
        connection.execute(text("ALTER TABLE documents ALTER COLUMN id TYPE VARCHAR(255)"))
        connection.execute(text("ALTER TABLE document_chat_turns ALTER COLUMN document_id TYPE VARCHAR(255)"))

        candidates = list(connection.execute(text(
            "SELECT document_id, owner_id, MIN(created_at) AS created_at "
            "FROM document_chat_turns GROUP BY document_id, owner_id"
        )).mappings())
        inspector = inspect(connection)
        if inspector.has_table("langchain_pg_embedding") and inspector.has_table("langchain_pg_collection"):
            candidates.extend(connection.execute(text(
                "SELECT DISTINCT e.cmetadata->>'document_id' AS document_id, "
                "CAST(e.cmetadata->>'owner_id' AS BIGINT) AS owner_id, NULL AS created_at "
                "FROM langchain_pg_embedding e "
                "JOIN langchain_pg_collection c ON c.uuid = e.collection_id "
                "WHERE c.name = :collection "
                "AND e.cmetadata->>'document_id' IS NOT NULL "
                "AND e.cmetadata->>'owner_id' ~ '^[0-9]+$'"
            ), {"collection": COLLECTION_NAME}).mappings())

        users = set(connection.scalars(text("SELECT id FROM users")))
        owners = {row.id: row.owner_id for row in connection.execute(select(Document.id, Document.owner_id))}
        added = 0
        for row in candidates:
            document_id, owner_id = row["document_id"], row["owner_id"]
            if not document_id or len(document_id) > 255 or owner_id not in users:
                raise RuntimeError("A legacy document has an invalid ID or a missing owner. No changes were committed.")
            if document_id in owners and owners[document_id] != owner_id:
                raise RuntimeError("A legacy document ID belongs to multiple owners. No changes were committed.")
            if document_id in owners:
                continue
            values = {"id": document_id, "owner_id": owner_id, "name": document_id, "original_file_name": document_id}
            if row["created_at"] is not None:
                values["created_at"] = row["created_at"]
            connection.execute(insert(Document).values(**values))
            owners[document_id] = owner_id
            added += 1

        foreign_keys = inspect(connection).get_foreign_keys("document_chat_turns")
        for column, target, name in [
            ("document_id", "documents", "fk_document_chat_turns_document"),
            ("owner_id", "users", "fk_document_chat_turns_owner"),
        ]:
            if not any(fk["constrained_columns"] == [column] and fk["referred_table"] == target for fk in foreign_keys):
                connection.execute(text(f"ALTER TABLE document_chat_turns ADD CONSTRAINT {name} FOREIGN KEY ({column}) REFERENCES {target}(id)"))
        for table in (Document.__table__, DocumentChatTurn.__table__):
            for index in table.indexes:
                index.create(connection, checkfirst=True)
    print(f"Document chat migration complete. Restored {added} legacy documents.")


if __name__ == "__main__":
    migrate()
