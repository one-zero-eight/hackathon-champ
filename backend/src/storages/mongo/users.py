__all__ = ["User", "UserRole"]

from enum import StrEnum

from beanie import PydanticObjectId
from pymongo import IndexModel

from src.pydantic_base import BaseSchema
from src.storages.mongo.__base__ import CustomDocument


class UserRole(StrEnum):
    DEFAULT = "default"
    ADMIN = "admin"


class UserSchema(BaseSchema):
    login: str
    password_hash: str
    federation: PydanticObjectId | None = None
    role: UserRole = UserRole.DEFAULT
    email: str | None = None


class User(UserSchema, CustomDocument):
    class Settings:
        indexes = [
            IndexModel("login", unique=True),
        ]
