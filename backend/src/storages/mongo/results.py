from beanie import PydanticObjectId
from pymongo import IndexModel

from src.pydantic_base import BaseSchema
from src.storages.mongo.__base__ import CustomDocument


class JustName(BaseSchema):
    name: str
    "ФИО участника"


class TeamPlace(BaseSchema):
    place: int
    "Место (1, 2, 3)"
    team: str
    "Название команды"
    members: list[PydanticObjectId | JustName]
    "Состав команды"
    score: float | None = None
    "Очки"


class SoloPlace(BaseSchema):
    place: int
    "Место (1, 2, 3)"
    participant: PydanticObjectId | JustName
    "ФИО участника"
    score: float | None = None
    "Очки"


class Protocol(BaseSchema):
    by_url: str | None = None
    "Ссылка на протокол"
    by_file: str | None = None
    "Путь к файлу в S3"


class ResultsSchema(BaseSchema):
    event_id: PydanticObjectId
    "ID мероприятия, к которому относятся результаты"
    event_title: str
    "Название мероприятия"
    protocols: list[Protocol] | None = None
    "Протоколы зачёта, список ссылок"
    team_places: list[TeamPlace] | None = None
    "Места команд"
    solo_places: list[SoloPlace] | None = None
    "Места участников"


class Results(ResultsSchema, CustomDocument):
    class Settings:
        indexes = [IndexModel("event_id", unique=True)]
