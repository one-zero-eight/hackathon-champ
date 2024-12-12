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
    related_federation: PydanticObjectId | None = None
    "Связанные федерации"
    gender: Gender | None = None
    "Пол"
    email: str | None = None
    "Электронная почта"
    rank: str | None = None
    "Разряд: мастер спорта; кандидат в мастера спорта; первый спортивный разряд; второй спортивный разряд; третий спортивный разряд; первый юношеский спортивный разряд; второй юношеский спортивный разряд; третий юношеский спортивный разряд."


class Participant(ParticipantSchema, CustomDocument):
    pass
