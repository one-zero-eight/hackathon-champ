import datetime
from enum import StrEnum
from typing import Any

import pymongo
from beanie import PydanticObjectId
from pymongo import IndexModel

from src.modules.events.schemas import Gender
from src.pydantic_base import BaseSchema
from src.storages.mongo.__base__ import CustomDocument


class EventLocation(BaseSchema):
    country: str
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


class TeamPlace(BaseSchema):
    place: str
    "Место (1, 2, 3-5)"
    team: str
    "Название команды"
    members: list[str]
    "Состав команды"
    score: Any | None = None
    "Очки"


class Protocol(BaseSchema):
    by_url: str | None = None
    "Ссылка на протокол"
    by_file: str | None = None
    "Путь к файлу в S3"


class Results(BaseSchema):
    protocols: list[Protocol] = []
    "Протоколы зачёта, список ссылок"
    team_places: list[TeamPlace] = []
    "Места команд"


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
    sport: str
    "Название вида спорта"
    discipline: list[str]
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


class Event(EventSchema, CustomDocument):
    class Settings:
        indexes = [
            IndexModel(
                [
                    ("title", pymongo.TEXT),
                    ("description", pymongo.TEXT),
                    ("sport", pymongo.TEXT),
                    ("location.country", pymongo.TEXT),
                    ("location.region", pymongo.TEXT),
                    ("location.city", pymongo.TEXT),
                ],
                default_language="russian",
                name="text_index",
            ),
            IndexModel([("start_date", pymongo.ASCENDING)]),
            IndexModel([("end_date", pymongo.ASCENDING)]),
            IndexModel([("location.country", pymongo.ASCENDING)]),
            IndexModel([("location.region", pymongo.ASCENDING)]),
            IndexModel([("location.city", pymongo.ASCENDING)]),
            IndexModel([("sport", pymongo.ASCENDING)]),
            IndexModel([("discipline", pymongo.ASCENDING)]),
            IndexModel([("gender", pymongo.HASHED)]),
            IndexModel([("age_min", pymongo.ASCENDING)]),
            IndexModel([("age_max", pymongo.ASCENDING)]),
        ]
