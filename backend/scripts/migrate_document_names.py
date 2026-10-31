"""Run from backend: .venv/Scripts/python scripts/migrate_document_names.py."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text
from database.connection import engine


def upgrade_document_names(connection):
    connection.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS name VARCHAR(255)"))
    connection.execute(text(
        "UPDATE documents SET name = COALESCE(NULLIF(BTRIM(original_file_name), ''), id) "
        "WHERE name IS NULL OR BTRIM(name) = ''"
    ))
    connection.execute(text("ALTER TABLE documents ALTER COLUMN name SET NOT NULL"))


def migrate():
    with engine.begin() as connection:
        connection.execute(text("SELECT pg_advisory_xact_lock(742901663)"))
        upgrade_document_names(connection)
    print("Document names migration complete.")


if __name__ == "__main__":
    migrate()
