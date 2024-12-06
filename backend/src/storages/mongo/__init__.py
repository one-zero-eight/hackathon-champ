from typing import cast

from beanie import Document, View

from src.storages.mongo.email import EmailFlow
from src.storages.mongo.events import Event
from src.storages.mongo.federation import Federation
from src.storages.mongo.feedback import Feedback
from src.storages.mongo.notify import Notify
from src.storages.mongo.selection import Selection
from src.storages.mongo.users import User

document_models = cast(
    list[type[Document] | type[View] | str],
    [User, Federation, Event, Selection, Feedback, Notify, EmailFlow],
)
