from fastapi import HTTPException, status


class AuthenticationException(HTTPException):
    def __init__(self, message: str = "Unauthenticated"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
        )
