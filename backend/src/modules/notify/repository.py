import asyncio

from beanie import PydanticObjectId

from src.storages.mongo.notify import (
    AccreditationRequestEvent,
    AccreditationRequestFederation,
    AccreditedEvent,
    AccreditedFederation,
    NewFeedback,
    Notify,
    NotifySchema,
)


class NotifyRepository:
    async def create_notify(self, data: NotifySchema) -> Notify:
        from src.modules.email.smtp_repository import smtp_repository
        from src.modules.users.repository import user_repository

        created: Notify = await Notify.model_validate(data, from_attributes=True).insert()
        emails = []
        if created.for_admin:
            users = await user_repository.read_all_admins()
            emails.extend([user.email for user in users if user.email])
        if created.for_federation:
            users = await user_repository.read_for_federation(created.for_federation)
            emails.extend([user.email for user in users if user.email])
        if smtp_repository and emails:
            # noinspection PyAsyncCall
            asyncio.create_task(self._email(created, emails))

        return created

    async def _email(self, created: Notify, emails: list[str]):
        from src.modules.email.smtp_repository import smtp_repository
        from src.modules.events.repository import events_repository
        from src.modules.federation.repository import federation_repository
        from src.modules.feedback.repository import feedback_repository

        if isinstance(created.inner, AccreditationRequestFederation):
            federation = await federation_repository.read_one(created.inner.federation_id)
            href = f"https://champ.innohassle.ru/manage/federations/{created.inner.federation_id}"
            msg = f'<p>Поступила <a href="{href}">заявка на аккредитацию федерации {federation.region}</a></p>'
            if federation.accreditation_comment:
                msg += f"<p>Комментарий: {federation.accreditation_comment}</p>"
        elif isinstance(created.inner, AccreditationRequestEvent):
            event = await events_repository.read_one(created.inner.event_id)
            href = f"https://champ.innohassle.ru/manage/events/{created.inner.event_id}"
            msg = f'<p>Поступила <a href="{href}">заявка на аккредитацию события {event.name}</a></p>'
            if event.comment:
                msg += f"<p>Комментарий: {event.accreditation_comment}</p>"
        elif isinstance(created.inner, AccreditedFederation):
            federation = await federation_repository.read_one(created.inner.federation_id)
            href = "https://champ.innohassle.ru/manage/region/home"
            status_element = f'<span style="color: {created.inner.status.color()}">{created.inner.status.ru()}</span>'
            msg = f'<p>Обновление <a href="{href}">статуса аккредитации федерации {federation.region}</a></p><p>Статус: {status_element}</p>'
            if created.inner.status_comment:
                msg += f"<p>Комментарий: {created.inner.status_comment}</p>"
        elif isinstance(created.inner, AccreditedEvent):
            event = await events_repository.read_one(created.inner.event_id)
            href = f"https://champ.innohassle.ru/manage/events/{created.inner.event_id}"
            status_element = f'<span style="color: {created.inner.status.color()}">{created.inner.status.ru()}</span>'
            msg = f'<p>Обновление <a href="{href}">статуса аккредитации события {event.name}</a></p><p>Статус: {status_element}</p><p>Комментарий: {created.inner.status_comment}</p>'
        elif isinstance(created.inner, NewFeedback):
            feedback = await feedback_repository.get(created.inner.feedback_id)
            href = "https://champ.innohassle.ru/manage/feedback/all"
            msg = f'<p>Получена <a href="{href}">новая обратная связь</a>: {feedback.text}</p><p>{feedback.email}</p>'
        else:
            msg = "Новое уведомление!"
        message = smtp_repository.render_notify_message(msg)
        smtp_repository.send(message, emails)

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
