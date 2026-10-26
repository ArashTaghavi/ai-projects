from typing import Annotated

from fastapi import Depends
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker


class Settings(BaseSettings):
    DATABASE_URL: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings() # type: ignore

engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)


def get_db():
    with SessionLocal() as db:
        yield db


DbSession = Annotated[Session, Depends(get_db)]
