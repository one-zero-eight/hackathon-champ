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
        return await Federation.insert_one(federation)


federation_repository: FederationRepository = FederationRepository()
