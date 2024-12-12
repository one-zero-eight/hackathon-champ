from beanie import PydanticObjectId

from src.storages.mongo import Participant
from src.storages.mongo.participant import ParticipantSchema


class ParticipantRepository:
    async def read_all(self) -> list[Participant]:
        return await Participant.all().to_list()

    async def read_for_federation(self, federation_id: PydanticObjectId) -> list[Participant]:
        return await Participant.find({"related_federation": federation_id}).to_list()

    async def read_many(self, ids: list[PydanticObjectId]) -> list[Participant]:
        return await Participant.find({"_id": {"$in": ids}}).to_list()

    async def create(self, data: ParticipantSchema) -> Participant:
        return await Participant.model_validate(data, from_attributes=True).insert()


participant_repository: ParticipantRepository = ParticipantRepository()
