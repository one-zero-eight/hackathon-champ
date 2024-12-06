from typing import cast

from beanie import Document, View

from src.storages.mongo.events import Event
from src.storages.mongo.notifies import Notification
from src.storages.mongo.selection import Selection
from src.storages.mongo.sports import Sport
from src.storages.mongo.users import User

document_models = cast(
    list[type[Document] | type[View] | str],
    [User, Event, Sport, Notification, Selection],
)
