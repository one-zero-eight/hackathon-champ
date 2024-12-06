from beanie import PydanticObjectId
from fastapi import APIRouter
from starlette.exceptions import HTTPException

from src.api.dependencies import USER_AUTH
from src.modules.notify.repository import notify_repository
from src.modules.users.repository import user_repository
from src.storages.mongo.feedback import Feedback, FeedbackSchema
from src.storages.mongo.notify import NewFeedback, NotifySchema
from src.storages.mongo.users import UserRole

router = APIRouter(prefix="/feedback", tags=["Feedback"])


class FeedbackRepository:
    async def create(self, feedback: FeedbackSchema) -> Feedback:
        return await Feedback.model_validate(feedback, from_attributes=True).insert()

    async def get_all(self) -> list[Feedback]:
        return await Feedback.all().to_list()

    async def get_all_for_federation(self, id: PydanticObjectId) -> list[Feedback]:
        return await Feedback.find(Feedback.federation == id).to_list()


feedback_repository = FeedbackRepository()


@router.post("/", responses={200: {"description": "Feedback created"}})
async def create_feedback(feedback: FeedbackSchema) -> Feedback:
    """
    Create one feedback.
    """
    created = await feedback_repository.create(feedback)
    await notify_repository.create_notify(
        NotifySchema(for_admin=True, for_federation=created.federation, inner=NewFeedback(feedback_id=created.id))
    )
    return created


@router.get(
    "/",
    responses={200: {"description": "Info about all feedback"}, 403: {"description": "Only admin can get feedback"}},
)
async def get_all_feedback(auth: USER_AUTH) -> list[Feedback]:
    """
    Get info about all feedback.
    """
    user = await user_repository.read(auth.user_id)
    if user.role == UserRole.ADMIN:
        return await feedback_repository.get_all()
    else:
        raise HTTPException(status_code=403, detail="Only admin can get feedback")


@router.get(
    "/federations/{id}",
    responses={
        200: {"description": "Info about all feedback for federation"},
        403: {"description": "Only admin and related federation can get feedback"},
    },
)
async def get_all_feedback_for_federation(id: PydanticObjectId, auth: USER_AUTH) -> list[Feedback]:
    """
    Get info about all feedback for federation.
    """
    user = await user_repository.read(auth.user_id)

    if user.role == UserRole.ADMIN or user.federation_id == id:
        return await feedback_repository.get_all_for_federation(id)
    else:
        raise HTTPException(status_code=403, detail="Only admin and related federation can get feedback")
