from typing import Annotated

from database.connection import DbSession
from database.models import User
from fastapi import Cookie, Depends

from core.auth.service import AuthService

Session = Annotated[str | None, Cookie()]


def get_current_user(db: DbSession, session: Session = None) -> User:
    return AuthService().me(db=db, token=session)


CurrentUser = Annotated[User, Depends(get_current_user)]
