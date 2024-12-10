import datetime
from enum import StrEnum
from typing import Literal

import pymongo
from beanie import PydanticObjectId
from pymongo import IndexModel

from src.modules.events.schemas import Gender
from src.pydantic_base import BaseSchema
from src.storages.mongo.__base__ import CustomDocument


class EventLocation(BaseSchema):
    country: str = "Россия"
    "Название страны"
    region: str | None = None
    "Название региона"
    city: str | None = None
    "Название города"

    def __str__(self):
        s = self.country
        if self.region:
            s += f", {self.region}"
        if self.city:
            s += f", {self.city}"
        return s


class EventStatusEnum(StrEnum):
    DRAFT = "draft"
    "Черновик"
    ON_CONSIDERATION = "on_consideration"
    "На рассмотрении"
    ACCREDITED = "accredited"
    "Аккредитовано"
    REJECTED = "rejected"
    "Отклонено"

    def ru(self):
        if self == EventStatusEnum.DRAFT:
            return "Черновик"
        if self == EventStatusEnum.ON_CONSIDERATION:
            return "На рассмотрении"
        if self == EventStatusEnum.ACCREDITED:
            return "Аккредитовано"
        if self == EventStatusEnum.REJECTED:
            return "Отклонено"

    def color(self):
        if self == EventStatusEnum.DRAFT:
            return "gray"
        if self == EventStatusEnum.ON_CONSIDERATION:
            return "blue"
        if self == EventStatusEnum.ACCREDITED:
            return "green"
        if self == EventStatusEnum.REJECTED:
            return "red"


class EventLevelEnum(StrEnum):
    local = "local"
    "Локальное"
    regional = "regional"
    "Региональное"
    interregional = "interregional"
    "Межрегиональное"
    federal = "federal"
    "Федеральное"
    international = "international"
    "Международное"


type Disciplines = (
    Literal[
        "программирование алгоритмическое",
        "программирование продуктовое",
        "программирование беспилотных авиационных систем",
        "программирование робототехники",
        "программирование систем информационной безопасности",
    ]
    | str
)


class TeamPlace(BaseSchema):
    place: int
    "Место (1, 2, 3)"
    team: str
    "Название команды"
    members: list[str]
    "Состав команды"
    score: float | None = None
    "Очки"


class SoloPlace(BaseSchema):
    place: int
    "Место (1, 2, 3)"
    participant: str
    "ФИО участника"
    score: float | None = None
    "Очки"


class Protocol(BaseSchema):
    by_url: str | None = None
    "Ссылка на протокол"
    by_file: str | None = None
    "Путь к файлу в S3"


class Results(BaseSchema):
    protocols: list[Protocol] | None = None
    "Протоколы зачёта, список ссылок"
    team_places: list[TeamPlace] | None = None
    "Места команд"
    solo_places: list[SoloPlace] | None = None
    "Места участников"


class EventSchema(BaseSchema):
    host_federation: PydanticObjectId | None = None
    "Федерация, организующая мероприятие (None - для парсинга со стороны разработчиков)"
    status: EventStatusEnum = EventStatusEnum.ON_CONSIDERATION
    "Статус мероприятия"
    status_comment: str | None = None
    "Комментарий к статусу"
    accreditation_comment: str | None = None
    "Комментарий к аккредитации. Заполняет представитель для того, чтобы сообщить доп. информацию администратору"
    title: str
    "Наименование спортивного мероприятия"
    description: str | None = None
    "Описание"
    gender: Gender | None = None
    "Пол участников (None - любой)"
    age_min: int | None = None
    "Минимальный возраст участников"
    age_max: int | None = None
    "Максимальный возраст участников"
    discipline: list[Disciplines]
    "Названия дисциплин"
    start_date: datetime.datetime
    "Дата начала"
    end_date: datetime.datetime
    "Дата конца"
    location: list[EventLocation]
    "Места проведения"
    participant_count: int | None = None
    "Количество участников"
    ekp_id: int | None = None
    "№ СМ в ЕКП"
    page: int | None = None
    "Страница в ЕКП"
    results: Results | None = None
    "Результаты мероприятия"
    level: EventLevelEnum | None = None
    "Уровень мероприятия"


class Event(EventSchema, CustomDocument):
    class Settings:
        indexes = [
            IndexModel(
                [
                    ("title", pymongo.TEXT),
                    ("description", pymongo.TEXT),
                    ("location.country", pymongo.TEXT),
                    ("location.region", pymongo.TEXT),
                    ("location.city", pymongo.TEXT),
                ],
                default_language="russian",
                name="text_index",
            ),
        ]
