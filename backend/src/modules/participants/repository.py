from beanie import PydanticObjectId

from src.storages.mongo import Participant


class ParticipantRepository:
    async def read_all(self) -> list[Participant]:
        return await Participant.all().to_list()

    async def read_for_federation(self, federation_id: PydanticObjectId) -> list[Participant]:
        return await Participant.find({"related_federations": {"$elemMatch": federation_id}}).to_list()


participant_repository: ParticipantRepository = ParticipantRepository()
