import datetime
import re
from io import BytesIO
from typing import Literal

import bs4
import httpx
import icalendar
import magic
import pandas as pd
import pdfplumber
from beanie import PydanticObjectId
from fastapi import APIRouter, Body, HTTPException, UploadFile
from pydantic import BaseModel
from starlette.responses import Response

from src.api.dependencies import USER_AUTH
from src.logging_ import logger
from src.modules.ai.repository import ai_repository
from src.modules.events.ics_utils import get_base_calendar
from src.modules.events.repository import events_repository
from src.modules.events.schemas import DateFilter, Filters, Pagination, Sort
from src.modules.federation.repository import federation_repository
from src.modules.notify.repository import notify_repository
from src.modules.users.repository import user_repository
from src.pydantic_base import BaseSchema
from src.storages.mongo.events import (
    Disciplines,
    Event,
    EventLocation,
    EventSchema,
    EventStatusEnum,
    Results,
    TeamPlace,
)
from src.storages.mongo.notify import AccreditationRequestEvent, AccreditedEvent, NotifySchema
from src.storages.mongo.selection import Selection
from src.storages.mongo.users import UserRole

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("/random-event")
async def get_random_event() -> Event:
    return await events_repository.get_random_event()


@router.get("/", responses={200: {"description": "Info about all events"}})
async def get_all_events() -> list[Event]:
    """
    Get info about all events.
    """
    return await events_repository.read_all()


@router.post(
    "/hint-results",
    responses={
        200: {"description": "Hint for event results"},
        400: {"description": "Cannot parse file"},
    },
)
async def hint_results(file: UploadFile) -> Results:
    bytes_ = await file.read()
    mime_type = magic.from_buffer(bytes_, mime=True)

    # CSV
    if mime_type in ("text/csv", "application/csv"):
        df = pd.read_csv(BytesIO(bytes_))

    # XLSX
    elif mime_type in (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/vnd.oasis.opendocument.spreadsheet",
    ):
        df = pd.read_excel(BytesIO(bytes_))

    # PDF using pdfplumber
    elif mime_type == "application/pdf":
        with pdfplumber.open(BytesIO(bytes_)) as pdf:
            tables = []
            for page in pdf.pages:
                table = page.extract_table()
                if table:
                    tables.append(table)

        if not tables:
            raise HTTPException(status_code=400, detail="Cannot parse file (no tables found)")

        header = tables[0][0]

        for t in tables:
            if t[0] == header:
                t.pop(0)

        # concat all tables if there are multiple
        df = pd.concat([pd.DataFrame(t, columns=header) for t in tables])
        # replace empty strings with NaN
        df.replace("", None, inplace=True)
    else:
        logger.warning(f"Cannot parse file with mime type {mime_type}")
        raise HTTPException(status_code=400, detail="Cannot parse file (unsupported format)")

    def is_place_column(column):
        return "место" in column.lower()

    def is_score_column(column):
        return "балл" in column.lower()

    def is_team_column(column):
        return "команда" in column.lower()

    place_column = next((c for c in df.columns if is_place_column(c)), None)
    score_column = next((c for c in df.columns[::-1] if is_score_column(c)), None)
    team_column = next((c for c in df.columns if is_team_column(c)), None)

    if team_column:
        team_places = []
        for i, row in df.iterrows():
            team: str = row[team_column]  # one-zero-eight (Булгаков, Авхадеев, Бельков, Дерябкин, Полин)
            member_sub = re.findall(r"\((.*?)\)", team)
            if member_sub:
                team = team.replace(member_sub[-1], "").replace("(", "").replace(")", "").strip()
                members = member_sub[-1].replace("(", "").replace(")", "").split(",")
                members = [m.strip() for m in members]
                members = [m for m in members if m]
            else:
                members = []

            team_places.append(
                TeamPlace(
                    place=row[place_column] if place_column else len(team_places) + 1,
                    team=team.strip(),
                    members=members,
                    score=row[score_column] if score_column else None,
                )
            )

        return Results(team_places=team_places)


@router.post(
    "/", responses={200: {"description": "Create many events"}, 403: {"description": "Only admin can create events"}}
)
async def create_many_events(events: list[EventSchema], auth: USER_AUTH) -> bool:
    """
    Create multiple events.
    """
    user = await user_repository.read(auth.user_id)

    if user.role == UserRole.ADMIN:
        to_create = []
        federations = await federation_repository.read_all()
        region_x_federation = {f.region.upper(): f.id for f in federations}
        for event in events:
            if len(event.location) == 1:
                location = event.location[0]
                if location.region:
                    event.host_federation = region_x_federation.get(location.region.upper())

            to_create.append(event)

        return await events_repository.create_many(events)
    else:
        raise HTTPException(status_code=403, detail="Only admin can create events")


class ShortenEvent(BaseSchema):
    title: str
    "Наименование спортивного мероприятия"
    description: str
    "Описание"
    discipline: list[Disciplines]
    "Названия дисциплин"
    start_date: datetime.datetime
    "Дата начала"
    end_date: datetime.datetime
    "Дата конца"
    location: EventLocation
    "Места проведения"


@router.post(
    "/hint-event",
    responses={
        200: {"description": "Hint for event creation"},
        400: {"description": "Cannot parse telegram post"},
    },
)
async def hint_event(
    telegram_post_link: str = Body(examples=["https://t.me/fsp_RT/67"], embed=True),
) -> ShortenEvent | None:
    # check if proper link
    if not re.match(r"https://t.me/[^/]+/\d+", telegram_post_link):
        logger.warning(f"Cannot parse telegram post because of invalid link: {telegram_post_link}")
        raise HTTPException(status_code=400, detail="Cannot parse telegram post because of invalid link")

    # get post
    try:
        async with httpx.AsyncClient(
            timeout=10,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
                )
            },
        ) as client:
            response = await client.get(telegram_post_link)
            response.raise_for_status()  # Raise exception if the status code is not 200

    except httpx.RequestError as e:
        logger.error(f"Cannot get telegram post: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail="Cannot parse telegram post because of request error")

    soup = bs4.BeautifulSoup(response.text, "html.parser")
    post = soup.find("meta", property="og:description")

    if post is None:
        logger.warning(f"Cannot parse telegram post: {telegram_post_link}")
        raise HTTPException(status_code=400, detail="Cannot parse telegram post")

    content = post["content"]
    logger.info(f"Telegram post content: {content}")

    if not ai_repository:
        raise HTTPException(status_code=400, detail="AI service is not available")

    event, message = await ai_repository.get_event_from_text(content)

    if event:
        return ShortenEvent(
            title=event.title,
            description=content,
            discipline=event.discipline,
            start_date=event.start_date,
            end_date=event.end_date,
            location=event.location,
        )
    else:
        raise HTTPException(status_code=400, detail=message)


@router.post("/suggest", responses={200: {"description": "Suggest event"}})
async def suggest_event(event: EventSchema, auth: USER_AUTH) -> Event:
    """
    Suggest event.
    """
    user = await user_repository.read(auth.user_id)
    event.host_federation = user.federation
    event.status_comment = None

    return await events_repository.suggest(event)


@router.post("/{id}/accredite", responses={200: {"description": "Event info updated"}})
async def accredite_event(
    id: PydanticObjectId, status: EventStatusEnum, auth: USER_AUTH, status_comment: str | None = None
) -> Event:
    """
    Accredit event.
    """
    user = await user_repository.read(auth.user_id)
    event = await events_repository.read_one(id)
    if user.role == UserRole.ADMIN or event.host_federation and user.federation == event.host_federation:
        event = await events_repository.accredite(id, status, status_comment)
        if event is None:
            raise HTTPException(status_code=404, detail="Event not found")
        if event.host_federation:
            await notify_repository.create_notify(
                NotifySchema(
                    for_federation=event.host_federation,
                    inner=AccreditedEvent(event_id=id, status=status, status_comment=status_comment),
                )
            )
        return event
    else:
        raise HTTPException(status_code=403, detail="Only admin can accredit event")


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
    events = await events_repository.read_with_filters(filters, sort, pagination)

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
    if filters.date and filters.date.start_date:
        current_year = filters.date.start_date.year
    else:
        current_year = datetime.datetime.now().year
    for i in range(1, 13):
        date_filter = DateFilter()
        date_filter.start_date = datetime.datetime(current_year, month=i, day=1)
        if i == 12:
            date_filter.end_date = datetime.datetime(current_year + 1, month=1, day=1)
        else:
            date_filter.end_date = datetime.datetime(current_year, month=i + 1, day=1)
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
    sport: Literal["Спортивное программирование"]
    "Название вида спорта"
    disciplines: list[Disciplines]
    "Названия дисциплин"


@router.get("/search/filters/disciplines", responses={200: {"description": "All disciplines"}})
async def get_all_filters_disciplines() -> DisciplinesFilterVariants:
    """
    Get all disciplines.
    """

    return DisciplinesFilterVariants(
        sport="Спортивное программирование",
        disciplines=[
            "программирование алгоритмическое",
            "программирование продуктовое",
            "программирование беспилотных авиационных систем",
            "программирование робототехники",
            "программирование систем информационной безопасности",
        ],
    )


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

        vevent.add("summary", f"{event.title}")
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


@router.get("/{id}", responses={200: {"description": "Info about event"}, 404: {"description": "Event not found"}})
async def get_event(id: PydanticObjectId) -> Event:
    """
    Get info about one event.
    """
    e = await events_repository.read_one(id)
    if e is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return e


@router.put(
    "/{id}",
    responses={
        200: {"description": "Event info updated"},
        403: {"description": "Only admin or related federation can update event"},
        404: {"description": "Event not found"},
    },
)
async def update_event(id: PydanticObjectId, event: EventSchema, auth: USER_AUTH) -> Event:
    """
    Update event.
    """
    user = await user_repository.read(auth.user_id)
    if user.role == UserRole.ADMIN or (event.host_federation and user.federation == event.host_federation):
        was = await events_repository.read_one(id)
        if was is None:
            raise HTTPException(status_code=404, detail="Event not found")
        updated = await events_repository.update(id, event)
        if was.status != EventStatusEnum.ON_CONSIDERATION and updated.status == EventStatusEnum.ON_CONSIDERATION:
            await notify_repository.create_notify(
                NotifySchema(
                    for_admin=True, inner=AccreditationRequestEvent(event_id=id, federation_id=event.host_federation)
                )
            )
        return updated
    else:
        raise HTTPException(status_code=403, detail="Only admin or related federation can update event")
