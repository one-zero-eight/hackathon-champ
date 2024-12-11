from src.storages.mongo import Participant


class ParticipantRepository:
    async def read_all(self) -> list[Participant]:
        return await Participant.all().to_list()


participant_repository: ParticipantRepository = ParticipantRepository()
