from datetime import UTC, datetime

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException

from src.api.dependencies import USER_AUTH
from src.api.exceptions import IncorrectCredentialsException
from src.modules.events.repository import events_repository
from src.modules.events.schemas import DateFilter, DisciplineFilter, Filters, Pagination, Sort
from src.modules.notifies.repository import Notification, notification_repository
from src.modules.notifies.scheams import Filter as NotifyFilter
from src.modules.notifies.scheams import NotificationCreateReq
from src.modules.sports.repository import sports_repository

router = APIRouter(
    prefix="/notify",
    tags=["Notifies"],
    responses={
        **IncorrectCredentialsException.responses,
    },
)


@router.post("/")
async def create_notification(notification_create: NotificationCreateReq, auth: USER_AUTH) -> PydanticObjectId:
    user_id = auth.user_id
    notification_to_insert: Notification
    notification_create = notification_create.model_dump()
    if notification_create["notification_type"]["type"] == "event":
        event = await events_repository.read_one(notification_create["notification_type"]["id"])
        if event is None or event.start_date < datetime.now(UTC):
            raise HTTPException(status_code=404)

        event_notifications = await notification_repository.list_notification_by_filter(
            NotifyFilter(user_id=user_id, sport_title=event.sport)
        )
        if len(event_notifications) > 0:
            raise HTTPException(
                status_code=400, detail=f"You already subscribed to event by using subscription to sport: {event.sport}"
            )

        notification_to_insert = Notification(
            event_title=event.title,
            sport_title=event.sport,
            user_id=user_id,
            event_id=event.id,
            event_dates=[event.start_date],
            subscription_info=notification_create["notification_options"],
        )
    else:
        sport = await sports_repository.read_one(str(notification_create["notification_type"]["id"]))
        if sport is None:
            raise HTTPException(status_code=404)

        events = await events_repository.read_with_filters(
            filters=Filters(
                discipline=[DisciplineFilter(sport=sport.sport)],
                date=DateFilter(
                    start_date=datetime.now(UTC),
                ),
            ),
            pagination=Pagination(page_no=1, page_size=10000000),
            sort=Sort(),
        )

        await notification_repository.make_sent_notifications_by_filter(
            filter=NotifyFilter(
                user_id=user_id,
                event_title=list(map(lambda item: item.title, events)),
            )
        )

        notification_to_insert = Notification(
            sport_title=sport.sport,
            event_dates=sorted(map(lambda item: item.start_date, events)),
            user_id=user_id,
            sport_id=sport.id,
            subscription_info=notification_create["notification_options"],
        )

    return await notification_repository.create_notification(notification_to_insert)


@router.get("/{notification_id}")
async def get_notification(notification_id: PydanticObjectId):
    notification = await notification_repository.get_notification(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


@router.post("/my-subscriptions")
async def get_user_subscriptions(auth: USER_AUTH) -> list[Notification]:
    user_id = auth.user_id
    return await notification_repository.get_notification_by_user_id(user_id)
