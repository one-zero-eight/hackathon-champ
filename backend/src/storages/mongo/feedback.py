from beanie import PydanticObjectId

from src.pydantic_base import BaseSchema
from src.storages.mongo.__base__ import CustomDocument


class FeedbackSchema(BaseSchema):
    subject: str
    "Тема сообщения"
    text: str
    "Текст сообщения"
    email: str | None = None
    "Email пользователя, если он хочет получить ответ на свой вопрос"
    federation: PydanticObjectId | None = None
    "ID федерации, если сообщение направлено к федерации"


class Feedback(FeedbackSchema, CustomDocument):
    pass
