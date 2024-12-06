import datetime
import random
from enum import StrEnum

from beanie import PydanticObjectId
from pydantic import BaseModel

from src.storages.mongo.email import EmailFlow


def _generate_auth_code() -> str:
    # return random 6-digit code
    return str(random.randint(100_000, 999_999))


EXPIRATION_TIME = 30  # minutes


class EmailFlowVerificationStatus(StrEnum):
    SUCCESS = "success"
    EXPIRED = "expired"
    INCORRECT = "incorrect"
    NOT_FOUND = "not_found"


class EmailFlowVerificationResult(BaseModel):
    status: EmailFlowVerificationStatus
    email_flow: EmailFlow | None = None


# noinspection PyMethodMayBeStatic
class EmailFlowRepository:
    async def start_flow(self, email: str, user_id: PydanticObjectId | None) -> EmailFlow:
        verification_code = _generate_auth_code()
        verification_code_expires_at = datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=EXPIRATION_TIME)

        email_flow = EmailFlow(
            email=email,
            verification_code=verification_code,
            verification_code_expires_at=verification_code_expires_at,
            user_id=user_id,
        )
        await email_flow.save()
        return email_flow

    async def get(self, email_flow_id: PydanticObjectId) -> EmailFlow:
        return await EmailFlow.get(email_flow_id)

    async def verify_flow(
        self,
        email_flow_id: PydanticObjectId,
        verification_code: str,
    ) -> EmailFlowVerificationResult:
        email_flow = await EmailFlow.find_one(EmailFlow.id == email_flow_id)
        if email_flow is None:
            return EmailFlowVerificationResult(status=EmailFlowVerificationStatus.NOT_FOUND)
        if email_flow.verification_code_expires_at < datetime.datetime.now(datetime.UTC):
            # delete flow
            await email_flow.delete()
            return EmailFlowVerificationResult(status=EmailFlowVerificationStatus.EXPIRED)
        if email_flow.verification_code != verification_code:
            return EmailFlowVerificationResult(status=EmailFlowVerificationStatus.INCORRECT)
        # clear all other verification codes
        await EmailFlow.find_many(
            {"email": email_flow.email, "_id": {"$ne": email_flow.id}, "is_verified": False}
        ).delete()

        # update
        await email_flow.update({"$set": {"verified_at": datetime.datetime.now(datetime.UTC), "is_verified": True}})

        return EmailFlowVerificationResult(status=EmailFlowVerificationStatus.SUCCESS, email_flow=email_flow)

    async def set_sent(self, id: PydanticObjectId) -> None:
        await EmailFlow.find_one(EmailFlow.id == id).update(
            {"$set": {"is_sent": True, "sent_at": datetime.datetime.now(datetime.UTC)}}
        )


email_flow_repository: EmailFlowRepository = EmailFlowRepository()
