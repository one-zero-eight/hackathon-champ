from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException

from src.api.dependencies import USER_AUTH
from src.modules.events.repository import events_repository
from src.modules.results.repository import result_repository
from src.modules.users.repository import user_repository
from src.storages.mongo import Results
from src.storages.mongo.results import ResultsSchema
from src.storages.mongo.users import UserRole

router = APIRouter(prefix="/results", tags=["Results"])


@router.put(
    "/",
    responses={
        200: {"description": "Results uploaded or updated"},
        403: {"description": "Only admin or related federation can upload results for event"},
        404: {"description": "Event not found"},
    },
)
async def upload_results(results: ResultsSchema, auth: USER_AUTH) -> Results:
    user = await user_repository.read(auth.user_id)
    event = await events_repository.read_one(results.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if user.role == UserRole.ADMIN or (event.host_federation and user.federation == event.host_federation):
        was = await result_repository.read_for_event(results.event_id)
        if was:
            if was.event_id != results.event_id:
                raise HTTPException(status_code=400, detail="Event id mismatch")
            return await result_repository.update(was.id, results)
        else:
            return await result_repository.create(results)
    else:
        raise HTTPException(status_code=403, detail="Only admin or related federation can update event")


@router.get("/for-event", responses={200: {"description": "Results about event"}})
async def get_result_for_event(event_id: PydanticObjectId) -> Results | None:
    r = await result_repository.read_for_event(event_id)
    return r


@router.post("/for-events", responses={200: {"description": "Results for events"}})
async def get_results_for_events(event_ids: list[PydanticObjectId]) -> list[Results]:
    r = await result_repository.read_for_event(*event_ids)
    return r


@router.get("/{id}", responses={200: {"description": "Results about event"}, 404: {"description": "Results not found"}})
async def get_result(id: PydanticObjectId) -> Results:
    r = await result_repository.read(id)
    if r is None:
        raise HTTPException(status_code=404, detail="Results not found")
    return r
