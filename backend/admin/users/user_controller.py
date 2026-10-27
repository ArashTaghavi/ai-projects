from database.connection import DbSession

from .user_service import UserService


class UserController:

    def __init__(self) -> None:
        self.service = UserService()

    def index(self, db: DbSession):
        return self.service.index(db=db)
