from fastapi import APIRouter

from .controller import DocumentChatController

router = APIRouter(prefix="/document-chat", tags=["document-chat"])

controller = DocumentChatController()

router.add_api_route("/", controller.index, methods=["GET"])
router.add_api_route("/items", controller.items, methods=["GET"])
