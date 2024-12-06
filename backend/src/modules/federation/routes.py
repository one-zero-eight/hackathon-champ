from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException

from src.api.dependencies import USER_AUTH
from src.api.exceptions import IncorrectCredentialsException
from src.modules.federation.repository import federation_repository
from src.modules.users.repository import user_repository
from src.storages.mongo import Federation
from src.storages.mongo.federation import FederationSchema, StatusEnum
from src.storages.mongo.users import UserRole

router = APIRouter(
    prefix="/federations",
    tags=["Federations"],
    responses={
        **IncorrectCredentialsException.responses,
    },
)


@router.get("/", responses={200: {"description": "Info about all federations"}})
async def get_all_federations() -> list[Federation]:
    """
    Get info about all events.
    """
    return await federation_repository.read_all()


@router.get(
    "/{id}", responses={200: {"description": "Info about federation"}, 404: {"description": "Federation not found"}}
)
async def get_federation(id: PydanticObjectId) -> Federation:
    """
    Get info about one event.
    """
    e = await federation_repository.read_one(id)
    if e is None:
        raise HTTPException(status_code=404, detail="Federation not found")
    return e


@router.post("/", responses={200: {"description": "Create federation"}})
async def create_federation(federation: FederationSchema, auth: USER_AUTH) -> Federation:
    """
    Create one federation.
    """
    user = await user_repository.read(auth.user_id)
    if user.role == UserRole.ADMIN:
        return await federation_repository.create(federation)
    else:
        federation.status = StatusEnum.ON_CONSIDERATION
        federation.status_comment = None
        return await federation_repository.create(federation)


@router.post(
    "/{id}",
    responses={
        200: {"description": "Federation info updated"},
        403: {"description": "Only admin can accredit federation"},
        404: {"description": "Federation not found"},
    },
)
async def accredite_federation(
    id: PydanticObjectId, status: StatusEnum, auth: USER_AUTH, status_comment: str | None = None
) -> Federation:
    """
    Accredit federation.
    """
    user = await user_repository.read(auth.user_id)
    if user.role == UserRole.ADMIN:
        federation = await federation_repository.accredite(id, status, status_comment)
        if federation is None:
            raise HTTPException(status_code=404, detail="Federation not found")
        return federation
    else:
        raise HTTPException(status_code=403, detail="Only admin can accredit federation")
