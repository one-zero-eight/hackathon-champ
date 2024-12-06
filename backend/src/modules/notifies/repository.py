from beanie import PydanticObjectId
from beanie.odm.operators.find.comparison import In

from src.modules.notifies.scheams import Filter
from src.storages.mongo.notifies import Notification


class NotificationRepository:
    async def create_notification(self, notification_data: Notification) -> PydanticObjectId:
        await notification_data.insert()
        return notification_data.id

    async def get_notification(self, notification_id: PydanticObjectId) -> Notification:
        return await Notification.get(notification_id)

    async def get_notification_by_user_id(self, user_id: PydanticObjectId) -> list[Notification]:
        return await Notification.find(Notification.user_id == user_id).to_list()

    async def make_sent_notifications_by_filter(self, filter: Filter):
        query = Notification.all()

        if filter.sport_title:
            query = query.find(Notification.sport_title == filter.sport_title)

        if filter.user_id:
            query = query.find(Notification.user_id == filter.user_id)

        if filter.event_title:
            query = query.find(In(Notification.event_title, filter.event_title))

        if filter.existing:
            query = query.find(Notification.sent == False)

        await query.update({"$set": {"sent": True}})

    async def list_all_valid_notifications(self) -> list[Notification]:
        return await Notification.find(Notification.sent == False).to_list()

    async def list_notification_by_filter(self, filter: Filter) -> list[Notification]:
        query = Notification.all()

        if filter.sport_title:
            query = query.find(Notification.sport_title == filter.sport_title)

        if filter.user_id:
            query = query.find(Notification.user_id == filter.user_id)

        if filter.event_title:
            query = query.find(In(Notification.event_title, filter.event_title))

        if filter.existing:
            query = query.find(Notification.sent == False)

        return await query.to_list()


notification_repository = NotificationRepository()
