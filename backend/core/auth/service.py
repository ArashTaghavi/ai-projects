import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from database.models import User, UserSession
from fastapi import HTTPException, Request, status
from pwdlib import PasswordHash
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from core.exceptions.validation_exception import ValidationException


class AuthService:
    password_hash = PasswordHash.recommended()

    def register(self, db: Session, username: str, password: str) -> User:
        existing_user = db.scalar(select(User).where(User.username == username))

        if existing_user:
            raise ValidationException(
                field="username",
                message=__("auth.username_exists"),
            )

        user = User(
            username=username,
            password=self.password_hash.hash(password),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    def login(
        self, db: Session, username: str, password: str, request: Request
    ) -> tuple[User, str]:
        user = db.scalar(select(User).where(User.username == username))

        if not user or not self.password_hash.verify(
            password=password, hash=user.password
        ):
            raise ValidationException(
                field="username",
                message=__("auth.invalid_credentials"),
            )

        token = secrets.token_urlsafe(32)

        session = UserSession(
            user_id=user.id,
            token_hash=hashlib.sha256(token.encode()).hexdigest(),
            expires_at=datetime.now(UTC) + timedelta(days=7),
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )

        db.add(session)
        db.commit()

        return user, token

    def me(self, db: Session, token: str | None) -> User:
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthenticated",
            )

        token_hash = hashlib.sha256(token.encode()).hexdigest()

        user = db.scalar(
            select(User)
            .join(UserSession, UserSession.user_id == User.id)
            .where(
                UserSession.token_hash == token_hash,
                UserSession.expires_at > datetime.now(UTC),
            )
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthenticated",
            )

        return user

    def logout(self, db: Session, token: str | None) -> None:
        if token:
            token_hash = hashlib.sha256(token.encode()).hexdigest()

            db.execute(delete(UserSession).where(UserSession.token_hash == token_hash))
            db.commit()
