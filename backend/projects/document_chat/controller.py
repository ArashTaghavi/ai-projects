from .service import DocumentChatService


class DocumentChatController:

    def __init__(self):
        self.service = DocumentChatService()

    def index(self):
        return {"message": "ok"}

    def items(self):
       return self.service.items()
