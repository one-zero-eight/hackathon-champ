from beanie import PydanticObjectId

from src.modules.results.repository import result_repository
from src.storages.mongo import Participant
from src.storages.mongo.participant import ParticipantSchema


class ParticipantRepository:
    async def read_all(self, skip: int | None = None, limit: int | None = None) -> list[Participant]:
        q = Participant.all().sort("name")
        if skip is not None:
            q = q.skip(skip)
        if limit is not None:
            q = q.limit(limit)
        return await q.to_list()

    async def read_for_federation(
        self, federation_id: PydanticObjectId, skip: int | None = None, limit: int | None = None
    ) -> list[Participant]:
        q = Participant.find({"related_federation": federation_id}).sort("name")
        if skip is not None:
            q = q.skip(skip)
        if limit is not None:
            q = q.limit(limit)
        return await q.to_list()

    async def stats_for_federation(self, federation_id: PydanticObjectId) -> dict[str, int]:
        q = Participant.find({"related_federation": federation_id}).aggregate(
            [{"$group": {"_id": "$rank", "count": {"$sum": 1}}}]
        )
        return await q.to_list()

    async def count_for_federation(self, federation_id: PydanticObjectId, gender: str | None = None) -> int:
        q = Participant.find({"related_federation": federation_id})
        if gender is not None:
            q = q.find({"gender": gender})
        return await q.count()

    async def read_many(self, ids: list[PydanticObjectId]) -> list[Participant]:
        return await Participant.find({"_id": {"$in": ids}}).to_list()

    async def exists_by_name(self, names: list[str]) -> list[Participant]:
        return await Participant.find({"name": {"$in": names}}).to_list()

    async def create(self, data: ParticipantSchema) -> Participant:
        return await Participant.model_validate(data, from_attributes=True).insert()

    async def delete(self, id: PydanticObjectId):
        await Participant.find_one({"_id": id}).delete()
        await result_repository.replace_id_with_none(id)

    async def update(self, id: PydanticObjectId, data: ParticipantSchema) -> Participant | None:
        await Participant.find_one({"_id": id}).update({"$set": data.model_dump()})
        return await Participant.get(id)

    async def create_many(self, data: list[ParticipantSchema]) -> None:
        await Participant.insert_many([Participant.model_validate(p, from_attributes=True) for p in data])


participant_repository: ParticipantRepository = ParticipantRepository()
