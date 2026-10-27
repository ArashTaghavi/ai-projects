from database.connection import DbSession
from database.models import User
from sqlalchemy import select

from .user_schema import UserCreate, UserUpdate


class UserService:

    def __init__(self, db: DbSession) -> None:
        self.db = db

    def index(self):
        return self.db.scalars(select(User).order_by(User.id)).all()

    def show(self, id: int):
        return self.db.get(User, id)

    def store(self, data: UserCreate):
        user = User(**data.model_dump())

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    def update(self, id: int, data: UserUpdate):
        user = self.show(id)

        if user is None:
            return None

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(user, key, value)

        self.db.commit()
        self.db.refresh(user)

        return user

    def destroy(self, id: int):
        user = self.show(id)

        if user is None:
            return False

        self.db.delete(user)
        self.db.commit()

        return True
