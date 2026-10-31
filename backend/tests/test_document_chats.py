import io
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database.models import BaseModel, Document, DocumentChatTurn, User
from modules.chat_with_document.dependencies import verify_document_access
from modules.chat_with_document.rag.rag import EmptyDocumentError
from modules.chat_with_document.service import ChatService
from modules.chat_with_document.router import router
from database.connection import get_db
from core.modules.auth.dependencies import get_current_user


class DocumentChatTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        @event.listens_for(self.engine, "connect")
        def enable_foreign_keys(connection, _):
            connection.execute("PRAGMA foreign_keys=ON")
        BaseModel.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        with self.sessions.begin() as db:
            db.add_all([User(id=1, username="owner", password="test"), User(id=2, username="other", password="test")])
        self.service = ChatService()
        self.rag = Mock()
        self.rag.ingest.return_value = ["1:document:0"]

    def tearDown(self):
        self.engine.dispose()

    def upload(self, document_id="document"):
        file = UploadFile(filename="report.docx", file=io.BytesIO(b"sample"))
        path = Mock(spec=Path)
        path.open.return_value = io.BytesIO()
        with patch("modules.chat_with_document.service.SessionLocal", self.sessions), patch("modules.chat_with_document.service.get_chat_with_document", return_value=self.rag):
            return self.service._save_and_ingest(file, path, document_id, 1, "Project report")

    def test_upload_persists_document_and_uses_same_id_for_vectors(self):
        self.upload()
        with self.sessions() as db:
            document = db.get(Document, "document")
            self.assertEqual(document.owner_id, 1)
            self.assertEqual(document.original_file_name, "report.docx")
            self.assertEqual(document.name, "Project report")
        self.assertEqual(self.rag.ingest.call_args.kwargs["document_id"], "document")

    def test_failed_ingestion_does_not_leave_document(self):
        self.rag.ingest.side_effect = EmptyDocumentError("empty")
        with self.assertRaises(EmptyDocumentError):
            self.upload()
        with self.sessions() as db:
            self.assertIsNone(db.get(Document, "document"))

    def test_commit_failure_cleans_vectors(self):
        with patch("sqlalchemy.orm.Session.commit", side_effect=RuntimeError("commit failed")):
            with self.assertRaisesRegex(RuntimeError, "commit failed"):
                self.upload()
        self.rag.vector_store.delete.assert_called_once_with(ids=["1:document:0"])
        with self.sessions() as db:
            self.assertIsNone(db.get(Document, "document"))

    def test_document_list_and_history_are_owner_scoped(self):
        self.upload()
        with self.sessions() as db:
            self.assertEqual([item.id for item in self.service.documents(db, 1)], ["document"])
            self.assertEqual(self.service.documents(db, 2), [])
            self.assertEqual(self.service.history(db, "document", 1), [])
            with self.assertRaises(HTTPException) as error:
                self.service.history(db, "document", 2)
            self.assertEqual(error.exception.status_code, 404)
            with self.assertRaises(HTTPException):
                verify_document_access(SimpleNamespace(document_id="document"), db, SimpleNamespace(id=2))

    def test_turn_requires_existing_document(self):
        with self.sessions() as db:
            db.add(DocumentChatTurn(owner_id=1, document_id="missing", question="Q", answer="A"))
            with self.assertRaises(IntegrityError):
                db.commit()

    def test_ask_saves_turn_linked_to_document(self):
        self.upload()
        self.rag.generate_answer.return_value = "Answer"
        with self.sessions() as db, patch("modules.chat_with_document.service.get_chat_with_document", return_value=self.rag), patch.object(self.service, "_lock_conversation"):
            self.assertEqual(self.service.ask(db, "Question", "document", 1), "Answer")
            turn = db.scalar(select(DocumentChatTurn))
            self.assertEqual(turn.document.id, "document")
            self.assertEqual(turn.question, "Question")
            self.assertEqual(len(db.get(Document, "document").chat_turns), 1)

    def test_api_lists_documents_and_reloads_history(self):
        self.upload()
        app = FastAPI()
        app.include_router(router)
        def test_db():
            with self.sessions() as db:
                yield db
        app.dependency_overrides[get_db] = test_db
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1)
        self.rag.generate_answer.return_value = "API answer"
        with TestClient(app) as client, patch("modules.chat_with_document.service.get_chat_with_document", return_value=self.rag), patch.object(ChatService, "_lock_conversation"):
            response = client.get("/chat-with-document/documents")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()[0]["id"], "document")
            self.assertEqual(response.json()[0]["original_file_name"], "report.docx")
            self.assertEqual(response.json()[0]["name"], "Project report")
            response = client.get("/chat-with-document/documents/document")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["id"], "document")
            self.assertEqual(response.json()["name"], "Project report")
            self.assertEqual(client.get("/chat-with-document/documents/missing").status_code, 404)
            response = client.post("/chat-with-document/ask", json={"document_id": "document", "query": "Question"})
            self.assertEqual(response.json(), {"answer": "API answer"})
            response = client.get("/chat-with-document/history", params={"document_id": "document"})
            self.assertEqual(response.json()[0]["answer"], "API answer")
            app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=2)
            self.assertEqual(client.get("/chat-with-document/documents").json(), [])
            self.assertEqual(client.get("/chat-with-document/documents/document").status_code, 404)
            self.assertEqual(client.get("/chat-with-document/history", params={"document_id": "document"}).status_code, 404)
            self.assertEqual(client.post("/chat-with-document/ask", json={"document_id": "document", "query": "Question"}).status_code, 404)

    def test_upload_requires_non_blank_name_and_trims_it(self):
        app = FastAPI()
        app.include_router(router)
        app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=1)
        with TestClient(app) as client, patch.object(ChatService, "_save_and_ingest", return_value=["chunk"]) as save:
            for data in ({}, {"name": ""}, {"name": "   "}, {"name": "x" * 256}):
                with self.subTest(data=data):
                    response = client.post("/chat-with-document/upload", data=data, files={"file": ("report.docx", b"sample")})
                    self.assertEqual(response.status_code, 422)
            save.assert_not_called()
            response = client.post("/chat-with-document/upload", data={"name": "  گزارش پروژه  "}, files={"file": ("report.docx", b"sample")})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["name"], "گزارش پروژه")
            self.assertEqual(save.call_args.args[-1], "گزارش پروژه")


if __name__ == "__main__":
    unittest.main()
