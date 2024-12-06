__all__ = ["federation_repository"]

from beanie import PydanticObjectId

from src.storages.mongo.federation import Federation, FederationSchema


# noinspection PyMethodMayBeStatic
class FederationRepository:
    async def read_one(self, id: PydanticObjectId) -> Federation | None:
        return await Federation.get(id)

    async def read_all(self) -> list[Federation] | None:
        return await Federation.all().to_list()

    async def create(self, federation: FederationSchema) -> Federation:
        return await Federation.model_validate(federation, from_attributes=True).insert()

    async def accredite(self, id: PydanticObjectId, status: str, status_comment: str | None) -> Federation | None:
        f = await Federation.get(id)
        if f is None:
            return None
        f.status = status
        f.status_comment = status_comment
        await f.save()
        return f


federation_repository: FederationRepository = FederationRepository()
