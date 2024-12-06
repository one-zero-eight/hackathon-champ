__all__ = ["Sport", "SportSchema"]

from src.pydantic_base import BaseSchema
from src.storages.mongo.__base__ import CustomDocument


class SportSchema(BaseSchema):
    sport: str
    "Название вида спорта"
    description: str | None = None
    "Описание спорта"
    disciplines: list[str]
    "Названия дисциплин"
    page: int | None = None
    "Страница в календаре МинСпорта"


class Sport(SportSchema, CustomDocument):
    class Settings:
        pass
