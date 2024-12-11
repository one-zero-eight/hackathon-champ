from beanie import PydanticObjectId

from src.storages.mongo import Results
from src.storages.mongo.results import ResultsSchema


class ResultRepository:
    async def create(self, results: ResultsSchema) -> Results:
        return await Results.model_validate(results, from_attributes=True).insert()

    async def read_all(self) -> list[Results]:
        return await Results.all().to_list()

    async def get_participant_count(self) -> int:
        results = await Results.all().to_list()
        unique_participants = set()
        for result in results:
            for solo_place in result["results"]["solo_places"] or []:
                unique_participants.add(str(solo_place["participant"]))
            for team_place in result["results"]["team_places"] or []:
                for member in team_place["members"]:
                    unique_participants.add(str(member))
        return len(unique_participants)

    async def read_for_participant(self, name_or_id: str | PydanticObjectId) -> list[Results]:
        if isinstance(name_or_id, PydanticObjectId):
            return await Results.find(
                {
                    "$or": [
                        {"solo_places.participant": name_or_id},
                        {"team_places.members": name_or_id},
                    ]
                }
            ).to_list()

        else:
            return await Results.find(
                {
                    "$or": [
                        {"solo_places.participant.name": name_or_id},
                        {"team_places.members.name": name_or_id},
                    ]
                }
            ).to_list()

    async def read_for_team(self, name: str) -> list[Results]:
        return await Results.find({"team_places.team": name}).to_list()


result_repository: ResultRepository = ResultRepository()
