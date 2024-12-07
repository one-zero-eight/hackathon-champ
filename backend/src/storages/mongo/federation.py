import datetime
from enum import StrEnum

from pydantic import Field

from src.pydantic_base import BaseSchema
from src.storages.mongo.__base__ import CustomDocument


class StatusEnum(StrEnum):
    ON_CONSIDERATION = "on_consideration"
    ACCREDITED = "accredited"
    REJECTED = "rejected"

    def ru(self):
        if self == StatusEnum.ON_CONSIDERATION:
            return "На рассмотрении"
        if self == StatusEnum.ACCREDITED:
            return "Аккредитована"
        if self == StatusEnum.REJECTED:
            return "Отклонена"

    def color(self):
        if self == StatusEnum.ON_CONSIDERATION:
            return "blue"
        if self == StatusEnum.ACCREDITED:
            return "green"
        if self == StatusEnum.REJECTED:
            return "red"


class FederationSchema(BaseSchema):
    region: str = Field(examples=["г. Москва"])
    "Название региона (области)"
    district: str | None = Field(None, examples=[None])
    "Название федерального округа"
    status: StatusEnum = StatusEnum.ON_CONSIDERATION
    "Статус федерации (на рассмотрении, аккредитована, отклонена)"
    status_comment: str | None = Field(None, examples=[None])
    "Комментарий к статусу"
    accreditation_comment: str | None = Field(None, examples=[None])
    "Комментарий к аккредитации. Заполняет представитель для того, чтобы сообщить о положении для аккредитации"
    description: str | None = Field(None, examples=[None])
    "Описание"
    head: str | None = Field(None, examples=["Анашкин Евгений Юрьевич"])
    "ФИО руководителя"
    email: str | None = Field(None, examples=["fspmsk@mail.ru"])
    "Электронная почта"
    phone: str | None = Field(None, examples=["+79268454512"])
    "Телефон"
    site: str | None = Field(None, examples=["https://fsp.moscow"])
    "Сайт"
    address: str | None = Field(None, examples=["г. Москва, ул. Сходненская, д.56"])
    "Адрес офиса"
    logo: str | None = Field(
        None, examples=["https://fsp-russia.com/upload/iblock/7b0/5n5imvtfzfn32tcqsdr2ce5adv7z73qv.jpg"]
    )
    "Ссылка на логотип (полный URL)"
    telegram: str | None = Field(None, examples=["https://t.me/fsprussia"])
    "Ссылка на канал в Telegram"
    last_interaction_at: datetime.datetime | None = Field(None, examples=[None])
    "Дата последнего взаимодействия с федерацией от представителя"
    notified_about_interaction: bool = Field(False, examples=[False])
    "Было ли уведомление о взаимодействии"


class Federation(FederationSchema, CustomDocument):
    pass
