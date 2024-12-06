import datetime
from enum import StrEnum

from beanie import PydanticObjectId
from pydantic import BaseModel


class DateFilter(BaseModel):
    start_date: datetime.datetime | None = None
    "Не раньше даты"
    end_date: datetime.datetime | None = None
    "Не позже даты"


class DisciplineFilter(BaseModel):
    sport: str
    "Название вида спорта"
    discipline: str | None = None
    "Название дисциплины"


class LocationFilter(BaseModel):
    country: str
    "Название страны"
    region: str | None = None
    "Название региона"
    city: str | None = None
    "Название города"


class MinMaxFilter(BaseModel):
    min: int | None = None
    "Не менее"
    max: int | None = None
    "Не более"


class Gender(StrEnum):
    male = "male"
    "Мужской пол"
    female = "female"
    "Женский пол"


class Filters(BaseModel):
    """Список фильтров, которые применяются через И"""

    query: str | None = None
    "Текстовый запрос, чтобы фильтровать по любому полю"
    date: DateFilter | None = None
    "Фильтр по дате"
    discipline: list[DisciplineFilter] | None = None
    "Фильтр по спортивным дисциплинам (применяется через ИЛИ)"
    location: list[LocationFilter] | None = None
    "Фильтр по локации (применяется через ИЛИ)"
    gender: Gender | None = None
    "Фильтр по полу участников"
    age: MinMaxFilter | None = None
    "Фильтр по возрасту участников"
    participant_count: MinMaxFilter | None = None
    "Фильтр по количеству участников соревнования"
    by_ids: list[PydanticObjectId] | None = None
    "Фильтр по ID событий (применяется только он, если указан)"


class Order(StrEnum):
    asc = "asc"
    "По возрастанию"
    desc = "desc"
    "По убыванию"


class Sort(BaseModel):
    date: Order | None = None
    "Сортировка по дате"
    age: Order | None = None
    "Сортировка по возрасту"
    participant_count: Order | None = None
    "Сортировка по количеству участников"


class Pagination(BaseModel):
    page_size: int
    "Количество элементов на странице"
    page_no: int
    "Номер страницы"
