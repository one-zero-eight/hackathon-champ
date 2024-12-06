from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Request

from src.api.dependencies import USER_AUTH
from src.api.exceptions import IncorrectCredentialsException
from src.modules.users.repository import user_repository
from src.modules.users.schemas import CreateUser, UpdateUser, ViewUser
from src.storages.mongo.users import UserRole

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={
        **IncorrectCredentialsException.responses,
    },
)


@router.get("/me", responses={200: {"description": "Current user info"}})
async def get_me(auth: USER_AUTH) -> ViewUser:
    """
    Get current user info if authenticated
    """

    user = await user_repository.read(auth.user_id)
    return user


@router.post(
    "/register",
    responses={200: {"description": "Successfully registered"}},
)
async def register_by_credentials(login: str, password: str, request: Request) -> None:
    """
    Register using credentials
    """
    from src.modules.users.schemas import CreateUser

    user = CreateUser(login=login, password=password)
    created = await user_repository.create(user)
    request.session["uid"] = str(created.id)


@router.post(
    "/create",
    responses={200: {"description": "Successfully created"}, 403: {"description": "Only admin can create users"}},
)
async def create_user(data: CreateUser, auth: USER_AUTH) -> ViewUser:
    """
    Create user
    """
    user = await user_repository.read(auth.user_id)
    if user.role == UserRole.ADMIN:
        created = await user_repository.create(data)
        return created
    else:
        raise IncorrectCredentialsException()


@router.get(
    "/", responses={200: {"description": "Info about all users"}, 403: {"description": "Only admin can get users"}}
)
async def get_all_users(auth: USER_AUTH) -> list[ViewUser]:
    """
    Get info about all users.
    """
    user = await user_repository.read(auth.user_id)
    if user.role == UserRole.ADMIN:
        return await user_repository.read_all()
    else:
        raise HTTPException(status_code=403, detail="Only admin can get users")


@router.get(
    "/{id}",
    responses={200: {"description": "Info about user"}, 403: {"description": "Only admin can get users"}},
)
async def get_user(id: PydanticObjectId, auth: USER_AUTH) -> ViewUser:
    """
    Get info about one user.
    """
    user = await user_repository.read(auth.user_id)
    if user.role == UserRole.ADMIN:
        u = await user_repository.read(id)
        if u is None:
            raise HTTPException(status_code=404, detail="User not found")
        return u
    else:
        raise HTTPException(status_code=403, detail="Only admin can get users")


@router.post(
    "/{id}",
    responses={
        200: {"description": "User info updated"},
        403: {"description": "Only admin can update users"},
        404: {"description": "User not found"},
    },
)
async def update_user(id: PydanticObjectId, data: UpdateUser, auth: USER_AUTH) -> ViewUser:
    """
    Update user info
    """
    user = await user_repository.read(auth.user_id)
    if user.role == UserRole.ADMIN:
        updated = await user_repository.update(id, data)
        if updated is None:
            raise HTTPException(status_code=404, detail="User not found")
        return updated
    else:
        raise HTTPException(status_code=403, detail="Only admin can update users")


@router.post(
    "/login",
    responses={200: {"description": "Successfully logged in (session updated)"}},
)
async def login_by_credentials(login: str, password: str, request: Request) -> None:
    """
    Login using credentials
    """
    from src.modules.login_and_password.repository import login_password_repository

    verification_result = await login_password_repository.verify_credentials(login, password)
    if verification_result is None:
        request.session.clear()
        raise IncorrectCredentialsException()

    request.session["uid"] = str(verification_result.user_id)


@router.post(
    "/logout",
    responses={200: {"description": "Successfully logged out (session cleared)"}},
)
async def logout(request: Request) -> None:
    """
    Logout (clear session)
    """
    request.session.clear()
    return None
