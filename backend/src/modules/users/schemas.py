from beanie import PydanticObjectId

from src.pydantic_base import BaseSchema


class CreateUser(BaseSchema):
    login: str
    password: str


class ViewUser(BaseSchema):
    id: PydanticObjectId
    login: str


class UserAuthData(BaseSchema):
    user_id: PydanticObjectId
