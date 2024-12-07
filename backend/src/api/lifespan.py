__all__ = ["lifespan"]

import asyncio
import datetime
import json
from contextlib import asynccontextmanager

from beanie import init_beanie
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import timeout
from pymongo.errors import ConnectionFailure

from src.config import settings
from src.logging_ import logger
from src.modules.files.repository import file_worker_repository
from src.storages.mongo import document_models


async def notification_loop():
    from src.modules.email.smtp_repository import smtp_repository
    from src.modules.federation.repository import federation_repository
    from src.modules.users.repository import user_repository

    if not smtp_repository:
        return

    while True:
        try:
            current_date = datetime.datetime.now(datetime.UTC)
            # older_than = current_date - datetime.timedelta(days=30)
            older_than = current_date - datetime.timedelta(minutes=1)

            federation_obsolete = await federation_repository.read_last_interacted_at(older_than)

            for federation in federation_obsolete:
                related_users = await user_repository.read_for_federation(federation.id)
                emails = [user.email for user in related_users if user.email]
                if emails:
                    href = f"https://champ.innohassle.ru/manage/federations/{federation.id}"
                    msg = f'Данные Федерации Спортивного Программирования `{federation.region}` не обновлялись более 30 дней. Пожалуйста, <a href="{href}">обновите их</a>.'
                    message = smtp_repository.render_notify_message(msg)
                    smtp_repository.send(message, emails)
                await federation_repository.set_notified_about_interaction(federation.id)

            await asyncio.sleep(60 * 15)
        except Exception:
            logger.error("Notification loop error", exc_info=True)
            await asyncio.sleep(60)


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


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Application startup
    motor_client = await setup_database()
    file_worker_repository.create_bucket()
    asyncio.create_task(notification_loop())
    yield

    # -- Application shutdown --
    motor_client.close()
