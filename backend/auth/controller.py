from typing import Annotated

from core.http.responses import DataMessageResponse
from database.connection import DbSession
from fastapi import Cookie, Response

from .schemas import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from .service import AuthService


class AuthController:
    def __init__(self):
        self.service = AuthService()

    def register(
        self,
        data: RegisterRequest,
        db: DbSession,
    ) -> DataMessageResponse[RegisterResponse]:
        user = self.service.register(
            db=db,
            username=data.username,
            password=data.password,
        )

        return DataMessageResponse(
            message=__("auth.registered"),
            data=RegisterResponse(id=user.id, username=user.username),
        )

    def login(
        self, data: LoginRequest, db: DbSession, response: Response
    ) -> DataMessageResponse[LoginResponse]:
        user, token = self.service.login(
            db=db, username=data.username, password=data.password
        )

        response.set_cookie(
            key="session",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=60 * 60 * 24 * 7,
            path="/",
        )

        return DataMessageResponse(
            message=__("auth.logged_in"),
            data=LoginResponse(id=user.id, username=user.username),
        )

    def me(
        self,
        db: DbSession,
        session: Annotated[str | None, Cookie()] = None,
    ) -> DataMessageResponse[LoginResponse]:
        user = self.service.me(db=db, token=session)

        return DataMessageResponse(
            message="Authenticated",
            data=LoginResponse(id=user.id, username=user.username),
        )

    def logout(
        self,
        db: DbSession,
        response: Response,
        session: Annotated[str | None, Cookie()] = None,
    ) -> dict[str, str]:
        self.service.logout(db=db, token=session)

        response.delete_cookie(
            key="session",
            path="/",
            secure=False,
            httponly=True,
            samesite="lax",
        )

        return {"message": "Logged out successfully"}
