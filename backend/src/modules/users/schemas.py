__all__ = ["CreateUser", "ViewUser"]

from beanie import PydanticObjectId

from src.pydantic_base import BaseSchema


class CreateUser(BaseSchema):
    login: str
    password: str


class UpdateFavoriteReq(BaseSchema):
    favorite_ids: list[PydanticObjectId]


class ViewUser(BaseSchema):
    id: PydanticObjectId
    login: str
    favorites: list[PydanticObjectId]


class UserAuthData(BaseSchema):
    user_id: PydanticObjectId
