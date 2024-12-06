import datetime
from typing import Annotated, Literal

from beanie import PydanticObjectId
from pydantic import Discriminator, Field

from src.pydantic_base import BaseSchema
from src.storages.mongo.__base__ import CustomDocument
from src.storages.mongo.events import EventStatusEnum
from src.storages.mongo.federation import StatusEnum


class AccreditationRequestFederation(BaseSchema):
    """
    Пользователь зарегистрировал новую федерацию и отправил заявку на аккредитацию
    """

    notify_type: Literal["new_federation"] = "new_federation"
    "Тип уведомления"
    federation_id: PydanticObjectId
    "ID федерации"


class AccreditationRequestEvent(BaseSchema):
    """
    Пользователь отправил заявку на аккредитацию на событие
    """

    notify_type: Literal["new_event"] = "new_event"
    "Тип уведомления"
    event_id: PydanticObjectId
    "ID события"
    federation_id: PydanticObjectId
    "ID федерации"


class NewFeedback(BaseSchema):
    """
    Пользователь отправил обратную связь
    """

    notify_type: Literal["new_feedback"] = "new_feedback"
    "Тип уведомления"
    feedback_id: PydanticObjectId
    "ID обратной связи"


class AccreditedFederation(BaseSchema):
    """
    Федерация аккредитована или отклонена
    """

    notify_type: Literal["accredited_federation"] = "accredited_federation"
    "Тип уведомления"
    federation_id: PydanticObjectId
    "ID федерации"
    status: StatusEnum
    "Статус федерации"
    status_comment: str | None
    "Комментарий к статусу"


class AccreditedEvent(BaseSchema):
    """
    Событие аккредитовано или отклонено
    """

    notify_type: Literal["accredited_event"] = "accredited_event"
    "Тип уведомления"
    event_id: PydanticObjectId
    "ID события"
    status: EventStatusEnum
    "Статус события"
    status_comment: str | None
    "Комментарий к статусу"


Inner = Annotated[
    AccreditationRequestFederation | AccreditationRequestEvent | AccreditedFederation | AccreditedEvent | NewFeedback,
    Discriminator("notify_type"),
]


class NotifySchema(BaseSchema):
    created_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.UTC))
    "Дата создания уведомления"
    read_by: list[PydanticObjectId] = []
    "Список пользователей, которые прочитали уведомление"
    for_admin: bool = False
    "Для администраторов"
    for_federation: PydanticObjectId | None = None
    "Для какой федерации предназначено уведомление"

    inner: Inner
    "Тип уведомления и его содержимое"


class Notify(NotifySchema, CustomDocument):
    pass
