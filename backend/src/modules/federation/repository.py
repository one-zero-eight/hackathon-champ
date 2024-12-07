__all__ = ["federation_repository"]

import datetime

from beanie import PydanticObjectId

from src.storages.mongo.federation import Federation, FederationSchema


# noinspection PyMethodMayBeStatic
class FederationRepository:
    async def read_one(self, id: PydanticObjectId) -> Federation | None:
        return await Federation.get(id)

    async def read_by_region(self, region: str) -> Federation | None:
        return await Federation.find_one(Federation.region == region)

    async def read_all(self) -> list[Federation] | None:
        return await Federation.all().to_list()

    async def create(self, federation: FederationSchema) -> Federation:
        return await Federation.model_validate(federation, from_attributes=True).insert()

    async def update(self, id: PydanticObjectId, data: FederationSchema) -> Federation | None:
        await Federation.find_one(Federation.id == id).update({"$set": data.model_dump()})
        return await Federation.get(id)

    async def accredite(self, id: PydanticObjectId, status: str, status_comment: str | None) -> Federation | None:
        f = await Federation.get(id)
        if f is None:
            return None
        f.status = status
        f.status_comment = status_comment
        await f.save()
        return f

    async def touch(self, id: PydanticObjectId) -> None:
        await Federation.find_one(Federation.id == id).update(
            {"$set": {"last_interaction_at": datetime.datetime.now(datetime.UTC), "notified_about_interaction": False}}
        )

    async def read_last_interacted_at(self, older_than: datetime.datetime) -> list[Federation]:
        return await Federation.find(
            {"last_interaction_at": {"$lt": older_than}, "notified_about_interaction": False}
        ).to_list()

    async def set_notified_about_interaction(self, id: PydanticObjectId) -> None:
        await Federation.find_one({"_id": id}).update({"$set": {"notified_about_interaction": True}})


federation_repository: FederationRepository = FederationRepository()
