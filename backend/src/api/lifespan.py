__all__ = ["lifespan"]

import asyncio
import json
from contextlib import asynccontextmanager
from datetime import UTC, datetime

from beanie import init_beanie
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import timeout
from pymongo.errors import ConnectionFailure
from pywebpush import WebPushException, webpush

from src.config import settings
from src.logging_ import logger
from src.modules.notifies.repository import notification_repository
from src.modules.notifies.scheams import Filter
from src.storages.mongo import document_models

WAIT_MIN = 1440
VAPID_PRIVATE_KEY = "lkjHIc-u8DMZXfJu-PbY-xTitElQuGQcRr-tCvQtN5c"


async def setup_database() -> AsyncIOMotorClient:
    motor_client: AsyncIOMotorClient = AsyncIOMotorClient(
        settings.database_uri.get_secret_value(),
        connectTimeoutMS=5000,
        serverSelectionTimeoutMS=5000,
        tz_aware=True,
    )
    motor_client.get_io_loop = asyncio.get_running_loop  # type: ignore[method-assign]

    # healthcheck mongo
    try:
        with timeout(2):
            server_info = await motor_client.server_info()
            server_info_pretty_text = json.dumps(server_info, indent=2, default=str)
            logger.info(f"Connected to MongoDB: {server_info_pretty_text}")
    except ConnectionFailure as e:
        logger.critical(f"Could not connect to MongoDB: {e}")
        raise e

    mongo_db = motor_client.get_database()
    await init_beanie(database=mongo_db, document_models=document_models, recreate_views=True)
    return motor_client


async def push_notification():
    while True:
        print("🚀 Starting PUSH JOB")
        notifications = await notification_repository.list_all_valid_notifications()
        for notification in notifications:
            sent_notification_number = len(notification.event_dates)
            for start_date in notification.event_dates:
                days_before = None
                if (start_date - datetime.now(UTC)).days == 30:
                    days_before = 30
                elif (start_date - datetime.now(UTC)).days == 7:
                    days_before = 7
                elif (start_date - datetime.now(UTC)).days == 1:
                    days_before = 1
                    sent_notification_number -= 1
                elif (start_date - datetime.now(UTC)).days < 0:
                    sent_notification_number -= 1
                if days_before is not None:
                    outMsg: str
                    if notification.sport_id is not None:
                        if days_before == 1:
                           outMsg = f'Через {days_before} день соревнование по виду спорта "{notification.sport_title}"' 
                        else:
                            outMsg = f'Через {days_before} дней соревнование по виду спорта "{notification.sport_title}"'
                    elif notification.event_id is not None:
                        if days_before == 1:
                            outMsg = f'Через {days_before} день соревнование "{notification.event_title}" по виду спорта "{notification.sport_title}"'
                        else:
                            outMsg = f'Через {days_before} дней соревнование "{notification.event_title}" по виду спорта "{notification.sport_title}"'
                    try:
                        webpush(
                            subscription_info=notification.subscription_info,
                            data=json.dumps({"message": outMsg}),
                            vapid_private_key=VAPID_PRIVATE_KEY,
                            vapid_claims={"sub": "mailto:albertavkhadeev@gmail.com"},
                        )
                        print(f"Success push for user {notification.user_id}")
                    except WebPushException as ex:
                        print(f"Failed to send push notification for {notification.user_id}: {ex}")
            if sent_notification_number == 0:
                if notification.event_title is not None:
                    await notification_repository.make_sent_notifications_by_filter(
                        Filter(event_title=[notification.event_title], user_id=notification.user_id)
                    )
                elif notification.sport_title is not None:
                    await notification_repository.make_sent_notifications_by_filter(
                        Filter(sport_title=[notification.sport_title], user_id=notification.user_id)
                    )

        print("🚀 PUSH JOB FINISHED")
        await asyncio.sleep(WAIT_MIN * 60)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Application startup
    motor_client = await setup_database()
    asyncio.create_task(push_notification())
    yield

    # -- Application shutdown --
    motor_client.close()
