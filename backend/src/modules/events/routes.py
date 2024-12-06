from datetime import UTC, datetime, timedelta

import icalendar
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from starlette.responses import Response

from src.api.exceptions import IncorrectCredentialsException
from src.modules.events.repository import events_repository
from src.modules.events.schemas import DateFilter, Filters, Pagination, Sort
from src.modules.ics_utils import get_base_calendar
from src.modules.sports.repository import sports_repository
from src.storages.mongo.events import Event
from src.storages.mongo.selection import Selection

router = APIRouter(
    prefix="/events",
    tags=["Events"],
    responses={
        **IncorrectCredentialsException.responses,
    },
)


@router.get("/random-event")
async def get_random_event() -> Event:
    return await events_repository.get_random_event()

@router.get("/", responses={200: {"description": "Info about all events"}})
async def get_all_events() -> list[Event]:
    """
    Get info about all events.
    """
    return await events_repository.read_all()


@router.get("/{id}", responses={200: {"description": "Info about event"}, 404: {"description": "Event not found"}})
async def get_event(id: PydanticObjectId) -> Event:
    """
    Get info about one event.
    """
    e = await events_repository.read_one(id)
    if e is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return e


@router.post("/", responses={200: {"description": "Create many events"}})
async def create_many_events(events: list[Event]) -> bool:
    """
    Create multiple events.
    """
    return await events_repository.create_many(events)

class SearchEventsResponse(BaseModel):
    filters: Filters
    "Заданные фильтры"
    sort: Sort
    "Заданная сортировка"
    pagination: Pagination
    "Заданная пагинация"

    page: int
    "Текущая страница"
    pages_total: int
    "Всего страниц"

    events: list[Event]
    "Результат поиска"


@router.post("/search", responses={200: {"description": "Search events"}})
async def search_events(filters: Filters, sort: Sort, pagination: Pagination) -> SearchEventsResponse:
    """
    Search events.
    """
    now_ = datetime.now(UTC)

    def key(event: Event):
        if event.start_date <= now_ <= event.end_date:
            return 0
        if event.start_date > now_:
            return 1
        return 2

    events = await events_repository.read_with_filters(filters, sort, pagination)
    if not sort.date and not sort.age and not sort.participant_count:
        # sort default: current events, future events, past events
        events = sorted(events, key=key)

    return SearchEventsResponse(
        filters=filters,
        sort=sort,
        pagination=pagination,
        page=pagination.page_no,
        pages_total=1,
        events=events,
    )


@router.post("/search/count", responses={200: {"description": "Count events"}})
async def count_events(filters: Filters) -> int:
    """
    Count filtered events.
    """
    count = await events_repository.read_with_filters(filters, Sort(), Pagination(page_size=0, page_no=0), count=True)
    return count


@router.post("/search/count-by-month", responses={200: {"description": "Count events by months"}})
async def count_events_by_month(filters: Filters) -> dict[str, int]:
    """
    Count filtered events by months.
    """

    counts = {}
    current_year = datetime.now().year
    for i in range(1, 13):
        date_filter = DateFilter()
        date_filter.start_date = datetime(current_year, month=i, day=1)
        if i == 12:
            date_filter.end_date = datetime(current_year + 1, month=1, day=1)
        else:
            date_filter.end_date = datetime(current_year, month=i + 1, day=1)
        filters.date = date_filter
        count = await events_repository.read_with_filters(
            filters, Sort(), Pagination(page_size=0, page_no=0), count=True
        )
        counts[f"{current_year}-{i:02d}"] = count

    return counts


class RegionsFilterVariants(BaseModel):
    region: str | None
    "Название региона"
    cities: list[str]
    "Названия городов"


class LocationsFilterVariants(BaseModel):
    country: str
    "Название страны"
    regions: list[RegionsFilterVariants]
    "Названия регионов"


@router.get("/search/filters/locations", responses={200: {"description": "All locations"}})
async def get_all_filters_locations() -> list[LocationsFilterVariants]:
    """
    Get all locations.
    """
    # From all 'location' fields of events, get unique values
    countries: dict[str, dict[str, RegionsFilterVariants]] = {}
    unique_locs = set()
    _ = await events_repository.read_all_locations()
    for locations in _:
        for loc in locations:
            unique_locs.add((loc.get("country"), loc.get("region"), loc.get("city")))
    unique_locs = sorted(unique_locs, key=lambda x: (x[0], x[1] or "", x[2] or ""))

    for country, region, city in unique_locs:
        if region is None and city in (
            "городской округ",
            "деревня",
            "железнодорожной станции",
            "поселок",
            "поселок городского типа",
            "село",
        ):
            continue

        if country not in countries:
            countries[country] = {}
        if region not in countries[country]:
            countries[country][region] = RegionsFilterVariants(region=region, cities=[])
        if city not in countries[country][region].cities:
            countries[country][region].cities.append(city)

    return [
        LocationsFilterVariants(
            country=country,
            regions=list(regions.values()),
        )
        for country, regions in countries.items()
    ]


class DisciplinesFilterVariants(BaseModel):
    sport: str
    "Название вида спорта"
    disciplines: list[str]
    "Названия дисциплин"


@router.get("/search/filters/disciplines", responses={200: {"description": "All disciplines"}})
async def get_all_filters_disciplines() -> list[DisciplinesFilterVariants]:
    """
    Get all disciplines.
    """
    # From all 'sport' and 'disciplines' fields of events, get unique values
    sports = await sports_repository.read_all()
    return [
        DisciplinesFilterVariants(
            sport=sport.sport,
            disciplines=sport.disciplines,
        )
        for sport in sports
    ]


@router.post("/search/share", responses={200: {"description": "Share selection"}})
async def share_selection(filters: Filters, sort: Sort) -> Selection:
    """
    Share selection. Use this for .ics too.
    """
    selection = await events_repository.create_selection(filters, sort)
    return selection


@router.get(
    "/search/share/{selection_id}",
    responses={200: {"description": "Get selection"}, 404: {"description": "Selection not found"}},
)
async def get_selection(selection_id: PydanticObjectId) -> Selection:
    """
    Get selection.
    """
    selection = await events_repository.read_selection(selection_id)
    if selection is None:
        raise HTTPException(status_code=404, detail="Selection not found")

    return selection


@router.get(
    "/search/share/{selection_id}/.ics",
    response_class=Response,
    responses={
        200: {"description": "Get selection in .ics format"},
        404: {"description": "Selection not found"},
    },
)
async def get_selection_ics(selection_id: PydanticObjectId):
    selection = await events_repository.read_selection(selection_id)
    if selection is None:
        raise HTTPException(status_code=404, detail="Selection not found")

    date_filter = DateFilter()
    # week before and month after
    date_filter.start_date = datetime.now() - timedelta(days=7)
    date_filter.end_date = datetime.now() + timedelta(days=30)
    selection.filters.date = date_filter

    events = await events_repository.read_with_filters(
        filters=selection.filters,
        sort=selection.sort,
        pagination=Pagination(page_size=1000, page_no=1),
    )
    calendar = get_base_calendar()
    calendar["x-wr-calname"] = "Подборка Спортивных Событий"

    for event in events:
        uid = f"{str(event.id)}@innohassle.ru"

        vevent = icalendar.Event()
        vevent.add("uid", uid)

        vevent.add("summary", f"{event.sport}: {event.title}")
        vevent.add("dtstart", icalendar.vDate(event.start_date))
        vevent.add("dtend", icalendar.vDate(event.end_date))
        vevent.add("description", event.description)
        if event.location:
            vevent.add("location", "\n".join([str(loc) for loc in event.location]))
        calendar.add_component(vevent)

    return Response(
        content=calendar.to_ical(),
        media_type="text/calendar",
        headers={"Content-Disposition": 'attachment; filename="schedule.ics"'},
    )
