from pydantic import BaseModel, Field, field_validator


class RegisterRequest(BaseModel):

    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=50)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str):
        if not value[0].isalpha():
            raise ValueError("Username must start with a letter")

        return value


class RegisterResponse(BaseModel):
    id: int
    username: str
