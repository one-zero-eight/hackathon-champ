from src.modules.events.schemas import Filters, Sort
from src.pydantic_base import BaseSchema
from src.storages.mongo.__base__ import CustomDocument


class SelectionSchema(BaseSchema):
    filters: Filters
    "Filter for the selection."
    sort: Sort = Sort()
    "Sort for the selection."


class Selection(SelectionSchema, CustomDocument):
    pass
