import datetime
from io import StringIO

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Response

from src.api.dependencies import USER_AUTH
from src.logging_ import logger
from src.modules.events.repository import events_repository
from src.modules.federation.repository import federation_repository
from src.modules.notify.repository import notify_repository
from src.modules.participants.repository import participant_repository
from src.modules.results.repository import result_repository
from src.modules.users.repository import user_repository
from src.pydantic_base import BaseSchema
from src.storages.mongo import Federation
from src.storages.mongo.federation import FederationSchema, StatusEnum
from src.storages.mongo.notify import AccreditationRequestFederation, NotifySchema
from src.storages.mongo.users import UserRole

router = APIRouter(prefix="/federations", tags=["Federations"])


@router.get("/", responses={200: {"description": "Info about all federations"}})
async def get_all_federations() -> list[Federation]:
    """
    Get info about all events.
    """
    return await federation_repository.read_all()


@router.get("/.csv", responses={200: {"description": "Info about all federations"}})
async def get_all_federations_as_csv() -> Response:
    """
    Get info about all events.
    """
    import csv

    federations = await federation_repository.read_all()

    with StringIO() as f:
        fieldnames = list(FederationSchema.__pydantic_fields__.keys())
        for exclude in ["id", "last_interaction_at", "notified_about_interaction", "status", "status_comment"]:
            try:
                fieldnames.remove(exclude)
            except ValueError:
                pass
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for federation in federations:
            writer.writerow(federation.model_dump())
        f.seek(0)
        resp = f.getvalue()

    return Response(
        content=resp,
        media_type="application/csv",
        headers={"Content-Disposition": "attachment; filename=federations.csv"},
    )


class FederationStats(BaseSchema):
    total_participations: int
    "Сколько всего участий в мероприятиях этой федерации"
    participations_for_last_month: int
    "Сколько участников было на мероприятиях этой федерации за последний месяц"
    total_teams: int
    "Сколько всего команд участвует в мероприятиях этой федерации"
    teams_for_last_month: int
    "Сколько команд было на мероприятиях этой федерации за последний месяц"
    total_competitions: int
    "Сколько всего мероприятий провела эта федерация"
    competitions_for_last_month: int
    "Сколько мероприятий провела эта федерация за последний месяц"
    profile_fill_percentage: int
    "Процент заполненности профиля федерации"
    total_participants_in_registry: int
    "Сколько всего участников зарегистрировано в Реестре"
    total_male_in_registry: int
    "Сколько всего мужчин зарегистрировано в Реестре"
    total_female_in_registry: int
    "Сколько всего женщин зарегистрировано в Реестре"
    ranks: dict[str, int]
    "Сколько участников с каждым рангом у этой федерации"


@router.get("/{id}/stats")
async def stats_federation(id: PydanticObjectId) -> FederationStats:
    federation = await federation_repository.read_one(id)
    if federation is None:
        raise HTTPException(status_code=404, detail="Federation not found")

    events = await events_repository.read_for_federation(id)
    event_id_x_event = {e.id: e for e in events}
    results = await result_repository.read_for_federation(id)
    now = datetime.datetime.now(datetime.UTC)
    last_month = now - datetime.timedelta(days=30)
    total_participation = participations_for_last_month = total_teams = teams_for_last_month = 0

    for result in results:
        event = event_id_x_event.get(result.event_id)
        if result.solo_places:
            total_participation += len(result.solo_places)
            if event.start_date > last_month:
                participations_for_last_month += len(result.solo_places)
        if result.team_places:
            total_teams += len(result.team_places)
            if event.start_date > last_month:
                teams_for_last_month += len(result.team_places)

            total_participation += sum(len(p.members) for p in result.team_places)
            if event.start_date > last_month:
                participations_for_last_month += sum(len(p.members) for p in result.team_places)

    total_competitions = len(events)
    competitions_for_last_month = sum(1 for e in events if e.start_date > last_month)

    filled_fields = 0

    if federation.email:
        filled_fields += 1
    if federation.phone:
        filled_fields += 1
    if federation.head:
        filled_fields += 1
    if federation.telegram:
        filled_fields += 1
    if federation.site:
        filled_fields += 1
    if federation.address:
        filled_fields += 1
    if federation.logo:
        filled_fields += 1
    if federation.description:
        filled_fields += 1

    total_fields = 8
    profile_fill_percentage = (filled_fields / total_fields) * 100

    ranks = await participant_repository.stats_for_federation(id)
    logger.info(ranks)
    return FederationStats(
        total_participations=total_participation,
        participations_for_last_month=participations_for_last_month,
        total_teams=total_teams,
        teams_for_last_month=teams_for_last_month,
        total_competitions=total_competitions,
        competitions_for_last_month=competitions_for_last_month,
        profile_fill_percentage=round(profile_fill_percentage),
        total_participants_in_registry=await participant_repository.count_for_federation(id),
        total_male_in_registry=await participant_repository.count_for_federation(id, gender="male"),
        total_female_in_registry=await participant_repository.count_for_federation(id, gender="female"),
        ranks=await participant_repository.stats_for_federation(id),
    )


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
        federation.status = StatusEnum.ACCREDITED
        federation.status_comment = "Загружено администратором"
        return await federation_repository.create(federation)
    else:
        federation.status = StatusEnum.ON_CONSIDERATION
        federation.status_comment = None
        created = await federation_repository.create(federation)
        await notify_repository.create_notify(
            NotifySchema(for_admin=True, inner=AccreditationRequestFederation(federation_id=created.id))
        )
        return created


@router.post("/create-many", responses={200: {"description": "Create federations"}})
async def create_federations(federations: list[FederationSchema], auth: USER_AUTH) -> list[Federation]:
    """
    Create many federations.
    """
    user = await user_repository.read(auth.user_id)
    if user.role == UserRole.ADMIN:
        for f in federations:
            f.status = StatusEnum.ACCREDITED
            f.status_comment = "Загружено администратором"
        # create only if no with the same region
        return [
            await federation_repository.create(federation)
            for federation in federations
            if not await federation_repository.read_by_region(federation.region)
        ]
    else:
        raise HTTPException(status_code=403, detail="Only admin can create federations")


@router.post(
    "/{id}/accredite",
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
        await notify_repository.create_notify(
            NotifySchema(for_federation=id, inner=AccreditationRequestFederation(federation_id=id))
        )
        return federation
    else:
        raise HTTPException(status_code=403, detail="Only admin can accredit federation")


@router.post(
    "/{id}/touch",
    responses={
        200: {"description": "Touch federation"},
        403: {"description": "Only admin or federation owner can update federation"},
    },
)
async def touch_federation(id: PydanticObjectId, auth: USER_AUTH) -> None:
    """
    Touch federation to update last_interaction_at.
    """
    user = await user_repository.read(auth.user_id)
    if user.role == UserRole.ADMIN or user.federation == id:
        await federation_repository.touch(id)
    else:
        raise HTTPException(status_code=403, detail="Only admin or federation owner can update federation")


@router.put(
    "/{id}/",
    responses={
        200: {"description": "Update federation"},
        403: {"description": "Only admin or federation owner can update federation"},
    },
)
async def update_federation(id: PydanticObjectId, data: FederationSchema, auth: USER_AUTH) -> Federation:
    """
    Update one federation.
    """
    user = await user_repository.read(auth.user_id)
    if user.role == UserRole.ADMIN or user.federation == id:
        if user.federation == id:
            data.last_interaction_at = datetime.datetime.now(datetime.UTC)
            data.notified_about_interaction = False
        return await federation_repository.update(id, data)
    else:
        raise HTTPException(status_code=403, detail="Only admin or federation owner can update federation")
