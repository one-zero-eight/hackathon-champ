__all__ = ["sports_repository"]

from beanie import PydanticObjectId

from src.storages.mongo.sports import Sport


# noinspection PyMethodMayBeStatic
class SportsRepository:
    async def read_one(self, id: PydanticObjectId) -> Sport | None:
        return await Sport.get(id)

    async def read_all(self) -> list[Sport] | None:
        return await Sport.all().to_list()

    async def create_many(self, events: list[Sport]) -> bool:
        res = await Sport.insert_many(events)
        return res.acknowledged

    async def update_decriptions(self, name_x_descriptions: dict[str, str]):
        for name, description in name_x_descriptions.items():
            await Sport.get_motor_collection().update_one(
                {"sport": name},
                {"$set": {"description": description}},
            )


sports_repository: SportsRepository = SportsRepository()
