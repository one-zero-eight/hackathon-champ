__all__ = ["router"]

from typing import Annotated

from beanie import PydanticObjectId
from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel, EmailStr

from src.api.dependencies import USER_AUTH
from src.config import settings
from src.config_schema import Environment
from src.modules.email.email_repository import EmailFlowVerificationStatus, email_flow_repository
from src.modules.email.smtp_repository import smtp_repository
from src.modules.users.repository import user_repository

router = APIRouter(prefix="/email", tags=["Email"])


class EmailFlowReference(BaseModel):
    email_flow_id: PydanticObjectId


class EmailFlowResult(BaseModel):
    status: EmailFlowVerificationStatus
    email: str | None = None


if smtp_repository:

    @router.post("/connect-email", responses={200: {"description": "Start email flow"}})
    async def start_email_flow(email: Annotated[EmailStr, Body(embed=True)], auth: USER_AUTH) -> EmailFlowReference:
        from src.modules.email.smtp_repository import smtp_repository

        email_flow = await email_flow_repository.start_flow(email, auth.user_id)
        message = smtp_repository.render_verification_message(email_flow.email, email_flow.verification_code)
        smtp_repository.send(message, email_flow.email)
        await email_flow_repository.set_sent(email_flow.id)
        return EmailFlowReference(email_flow_id=email_flow.id)

    @router.post(
        "/validate-code", responses={200: {"description": "End email flow"}, 400: {"description": "Bad request"}}
    )
    async def end_email_flow(
        email_flow_id: Annotated[PydanticObjectId, Body()], verification_code: Annotated[str, Body()]
    ) -> EmailFlowResult:
        if settings.environment == Environment.DEVELOPMENT:
            email_flow = await email_flow_repository.get(email_flow_id)
            if verification_code == "666666":
                await user_repository.set_email(email_flow.user_id, email_flow.email)
                return EmailFlowResult(status=EmailFlowVerificationStatus.SUCCESS, email=email_flow.email)

        verification_result = await email_flow_repository.verify_flow(email_flow_id, verification_code)

        if verification_result.status == EmailFlowVerificationStatus.SUCCESS and verification_result.email_flow:
            await user_repository.set_email(
                verification_result.email_flow.user_id, verification_result.email_flow.email
            )
            return EmailFlowResult(
                status=verification_result.status,
                email=verification_result.email_flow.email if verification_result.email_flow else None,
            )
        raise HTTPException(400)
