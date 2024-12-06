from beanie import PydanticObjectId

from src.storages.mongo import Feedback
from src.storages.mongo.feedback import FeedbackSchema


class FeedbackRepository:
    async def create(self, feedback: FeedbackSchema) -> Feedback:
        return await Feedback.model_validate(feedback, from_attributes=True).insert()

    async def get_all(self) -> list[Feedback]:
        return await Feedback.all().to_list()

    async def get(self, id: PydanticObjectId) -> Feedback | None:
        return await Feedback.get(id)

    async def get_all_for_federation(self, id: PydanticObjectId) -> list[Feedback]:
        return await Feedback.find(Feedback.federation == id).to_list()


feedback_repository: FeedbackRepository = FeedbackRepository()
