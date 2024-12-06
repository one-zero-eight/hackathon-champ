__all__ = ["USER_AUTH", "get_current_user_auth"]

from typing import Annotated

from beanie import PydanticObjectId
from fastapi import Depends, HTTPException
from starlette.requests import Request

from src.api.exceptions import IncorrectCredentialsException
from src.modules.users.repository import user_repository
from src.modules.users.schemas import UserAuthData


async def get_current_user_auth(request: Request) -> UserAuthData:
    uid = request.session.get("uid")

    if uid is None:
        raise IncorrectCredentialsException(no_credentials=True)

    user_id = PydanticObjectId(uid)

    exists = await user_repository.exists(user_id)
    if not exists:
        request.session.clear()
        raise IncorrectCredentialsException()

    banned = await user_repository.is_banned(user_id)
    if banned:
        raise HTTPException(status_code=403, detail="You are banned 🥹")

    return UserAuthData(user_id=user_id)


USER_AUTH = Annotated[UserAuthData, Depends(get_current_user_auth)]
