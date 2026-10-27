from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    username: str
    password: str
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    avatar: str | None = None


class UserUpdate(BaseModel):
    password: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    avatar: str | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    first_name: str | None
    last_name: str | None
    email: EmailStr | None
    avatar: str | None
