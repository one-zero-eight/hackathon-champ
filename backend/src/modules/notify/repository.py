from beanie import PydanticObjectId

from src.storages.mongo.notify import Notify, NotifySchema


class NotifyRepository:
    async def create_notify(self, data: NotifySchema) -> Notify:
        return await Notify.model_validate(data, from_attributes=True).insert()

    async def get_notify(self, notify_id: PydanticObjectId) -> Notify | None:
        return await Notify.get(notify_id)

    async def get_for_admin(self) -> list[Notify]:
        return await Notify.find({"for_admin": True}).to_list()

    async def get_unread_for_admin(self, user_id: PydanticObjectId) -> list[Notify]:
        return await Notify.find({"for_admin": True, "read_by": {"$not": {"$elemMatch": {"$eq": user_id}}}}).to_list()

    async def get_for_federation(self, federation_id: PydanticObjectId) -> list[Notify]:
        return await Notify.find({"for_federation": federation_id}).to_list()

    async def read_unread_for_federation(
        self, federation_id: PydanticObjectId, user_id: PydanticObjectId
    ) -> list[Notify]:
        return await Notify.find(
            {"for_federation": federation_id, "read_by": {"$not": {"$elemMatch": {"$eq": user_id}}}}
        ).to_list()

    async def add_read_by(self, notify_id: PydanticObjectId, user_id: PydanticObjectId) -> Notify | None:
        await Notify.find_one({"_id": notify_id}).update({"$addToSet": {"read_by": user_id}})
        return await Notify.get(notify_id)


notify_repository: NotifyRepository = NotifyRepository()
