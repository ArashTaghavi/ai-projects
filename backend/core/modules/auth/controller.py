from typing import Annotated

from database.connection import DbSession
from fastapi import Cookie, Request, Response

from core.http.responses import DataMessageResponse, MessageResponse
from core.websocket.websocket_manager import manager

from .dependencies import CurrentUser
from .schemas import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from .service import AuthService


class AuthController:
    def __init__(self):
        self.service = AuthService()

    async def register(
        self,
        data: RegisterRequest,
        db: DbSession,
    ) -> DataMessageResponse[RegisterResponse]:
        user = self.service.register(
            db=db,
            username=data.username,
            password=data.password,
        )

        await manager.broadcast(
            {
                "type": "user.created",
                "data": {
                    "id": user.id,
                    "username": user.username,
                },
            }
        )

        return DataMessageResponse(
            message=__("auth.registered"),
            data=RegisterResponse(id=user.id, username=user.username),
        )

    def login(
        self, data: LoginRequest, db: DbSession, response: Response, request: Request
    ) -> DataMessageResponse[LoginResponse]:
        user, token = self.service.login(
            db=db, username=data.username, password=data.password, request=request
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
        user: CurrentUser,
    ) -> DataMessageResponse[LoginResponse]:
        return DataMessageResponse(
            message="Authenticated",
            data=LoginResponse(id=user.id, username=user.username),
        )

    def logout(
        self,
        db: DbSession,
        response: Response,
        session: Annotated[str | None, Cookie()] = None,
    ) -> MessageResponse:
        self.service.logout(db=db, token=session)

        response.delete_cookie(
            key="session",
            path="/",
            secure=False,
            httponly=True,
            samesite="lax",
        )

        return MessageResponse(message="Logged out successfully")
