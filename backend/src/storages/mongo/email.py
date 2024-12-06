import datetime

from beanie import PydanticObjectId
from pydantic import BaseModel

from src.storages.mongo.__base__ import CustomDocument


class EmailFlowSchema(BaseModel):
    email: str
    is_sent: bool = False
    sent_at: datetime.datetime | None = None
    is_verified: bool = False
    verified_at: datetime.datetime | None = None
    verification_code: str | None = None
    verification_code_expires_at: datetime.datetime | None = None
    user_id: PydanticObjectId


class EmailFlow(EmailFlowSchema, CustomDocument):
    pass
