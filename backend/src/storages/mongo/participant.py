import datetime

from beanie import PydanticObjectId

from src.pydantic_base import BaseSchema
from src.storages.mongo.__base__ import CustomDocument
from src.storages.mongo.events import Gender


class ParticipantSchema(BaseSchema):
    name: str
    "ФИО участника"
    birth_date: datetime.date | None = None
    "Дата рождения"
    related_federations: list[PydanticObjectId] = []
    "Связанные федерации"
    gender: Gender | None = None
    "Пол"
    email: str | None = None
    "Электронная почта"


class Participant(ParticipantSchema, CustomDocument):
    pass
