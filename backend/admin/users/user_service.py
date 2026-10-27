from database.models import User
from sqlalchemy.orm import Session


class UserService:

    def index(self, db: Session):
        return db.query(User).all()
