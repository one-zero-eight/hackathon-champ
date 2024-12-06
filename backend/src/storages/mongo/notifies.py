import datetime

from beanie import PydanticObjectId
from pymongo import IndexModel

from src.pydantic_base import BaseSchema
from src.storages.mongo.__base__ import CustomDocument


class NotifySchema(BaseSchema):
    event_title: str | None = None
    event_id: PydanticObjectId | None = None
    sport_title: str | None = None
    sport_id: PydanticObjectId | None = None
    subscription_info: dict
    event_dates: list[datetime.datetime]
    user_id: PydanticObjectId
    sent: bool = False


class Notification(NotifySchema, CustomDocument):
    class Settings:
        indexes = [
            IndexModel(["user_id", "event_id", "sport_id"], unique=True),
        ]
