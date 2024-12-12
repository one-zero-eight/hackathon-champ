from beanie import PydanticObjectId

from src.modules.results.repository import result_repository
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

    async def delete(self, id: PydanticObjectId):
        await Participant.delete(id)
        await result_repository.replace_id_with_none(id)

    async def update(self, id: PydanticObjectId, data: ParticipantSchema) -> Participant | None:
        await Participant.find_one({"_id": id}).update({"$set": data.model_dump()})
        return await Participant.get(id)


participant_repository: ParticipantRepository = ParticipantRepository()
