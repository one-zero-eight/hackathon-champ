from enum import StrEnum

from pydantic import Field
from pymongo import IndexModel

from src.pydantic_base import BaseSchema
from src.storages.mongo.__base__ import CustomDocument


class StatusEnum(StrEnum):
    ON_CONSIDERATION = "on_consideration"
    ACCREDITED = "accredited"
    REJECTED = "rejected"


class FederationSchema(BaseSchema):
    region: str = Field(examples=["г. Москва"])
    "Название региона (области)"
    district: str | None = Field(None, examples=[None])
    "Название федерального округа"
    status: StatusEnum = StatusEnum.ON_CONSIDERATION
    "Статус федерации (на рассмотрении, аккредитована, отклонена)"
    status_comment: str | None = Field(None, examples=[None])
    "Комментарий к статусу"
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


class Federation(FederationSchema, CustomDocument):
    class Settings:
        indexes = [IndexModel("title", unique=True)]
