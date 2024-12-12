from beanie import PydanticObjectId

from src.modules.events.repository import events_repository
from src.storages.mongo import Results
from src.storages.mongo.results import ResultsSchema


class ResultRepository:
    async def create(self, results: ResultsSchema) -> Results:
        return await Results.model_validate(results, from_attributes=True).insert()

    async def read(self, result_id: PydanticObjectId) -> Results | None:
        return await Results.get(result_id)

    async def update(self, result_id: PydanticObjectId, results: ResultsSchema) -> Results | None:
        return await Results.find_one({"_id": result_id}).update({"$set": results.model_dump()})

    async def read_all(self) -> list[Results]:
        return await Results.all().to_list()

    async def get_participant_count(self) -> int:
        results = await Results.all().to_list()
        unique_participants = set()
        for result in results:
            for solo_place in result.solo_places or []:
                unique_participants.add(str(solo_place.participant))
            for team_place in result.team_places or []:
                for member in team_place.members:
                    unique_participants.add(str(member))
        return len(unique_participants)

    async def read_for_participant(self, participant_id: PydanticObjectId) -> list[Results]:
        return await Results.find(
            {
                "$or": [
                    {"solo_places.participant": {"id": participant_id}},
                    {"team_places.members": {"id": participant_id}},
                ]
            }
        ).to_list()

    async def read_for_team(self, name: str) -> list[Results]:
        return await Results.find({"team_places.team": name}).to_list()

    async def read_for_event(self, event_id: PydanticObjectId) -> Results | None:
        return await Results.find({"event_id": event_id}).first_or_none()

    async def read_for_events(self, *event_ids: PydanticObjectId) -> list[Results]:
        return await Results.find({"event_id": {"$in": event_ids}}).to_list()

    async def read_for_federation(self, federation_id: PydanticObjectId) -> list[Results]:
        events_ids = await events_repository.read_for_federation_only_ids(federation_id)
        results = await self.read_for_events(*events_ids)
        return results


result_repository: ResultRepository = ResultRepository()
