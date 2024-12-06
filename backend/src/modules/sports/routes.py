import icalendar
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException
from starlette.responses import Response

from src.api.exceptions import IncorrectCredentialsException
from src.modules.events.repository import events_repository
from src.modules.events.schemas import DisciplineFilter, Filters, Order, Pagination, Sort
from src.modules.ics_utils import get_base_calendar
from src.modules.sports.repository import sports_repository
from src.storages.mongo import Sport

router = APIRouter(
    prefix="/sports",
    tags=["Sports"],
    responses={
        **IncorrectCredentialsException.responses,
    },
)


@router.get("/", responses={200: {"description": "Info about all sports"}})
async def get_all_sports() -> list[Sport]:
    """
    Get info about all sports.
    """
    return await sports_repository.read_all()


@router.get("/{id}", responses={200: {"description": "Info about sport"}})
async def get_sport(id: PydanticObjectId) -> Sport:
    """
    Get info about one sport.
    """
    return await sports_repository.read_one(id)


@router.post("/", responses={200: {"description": "Create many sports"}})
async def create_many_sports(sports: list[Sport]) -> bool:
    """
    Create multiple sports.
    """
    return await sports_repository.create_many(sports)


@router.post("/update_descriptions", responses={200: {"description": "Update descriptions"}})
async def update_descriptions(name_x_descriptions: dict[str, str]) -> None:
    """
    Update descriptions of sports.
    """
    await sports_repository.update_decriptions(name_x_descriptions)


@router.get(
    "/{id}/.ics",
    response_class=Response,
    responses={
        200: {"description": "Get sport's events in .ics format"},
        404: {"description": "Sport not found"},
    },
)
async def get_sport_ics(id: PydanticObjectId) -> Response:
    sport = await sports_repository.read_one(id)
    if sport is None:
        raise HTTPException(status_code=404, detail="Sport not found")

    filters = Filters(discipline=[DisciplineFilter(sport=sport.sport)])

    events = await events_repository.read_with_filters(
        filters=filters,
        sort=Sort(date=Order.asc),
        pagination=Pagination(page_size=1000, page_no=1),
    )

    calendar = get_base_calendar()
    calendar["x-wr-calname"] = f"Подборка Спортивных Событий ({sport.sport})"

    for event in events:
        uid = f"{str(event.id)}@innohassle.ru"

        vevent = icalendar.Event()
        vevent.add("uid", uid)

        vevent.add("summary", f"{event.title}")
        vevent.add("dtstart", icalendar.vDate(event.start_date))
        vevent.add("dtend", icalendar.vDate(event.end_date))
        vevent.add("description", f"{event.sport}\n\n{event.title}")
        if event.location:
            vevent.add("location", "\n".join([str(loc) for loc in event.location]))
        calendar.add_component(vevent)

    return Response(
        content=calendar.to_ical(),
        media_type="text/calendar",
        headers={"Content-Disposition": 'attachment; filename="sport.ics"'},
    )
