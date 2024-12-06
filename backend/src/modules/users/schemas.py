from beanie import PydanticObjectId

from src.pydantic_base import BaseSchema


class CreateUser(BaseSchema):
    login: str
    password: str
    federation: PydanticObjectId | None = None


class UpdateUser(BaseSchema):
    login: str | None = None
    password: str | None = None
    federation: PydanticObjectId | None = None


class ViewUser(BaseSchema):
    id: PydanticObjectId
    login: str
    federation: PydanticObjectId | None = None


class UserAuthData(BaseSchema):
    user_id: PydanticObjectId
