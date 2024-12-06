__all__ = ["events_repository"]


from beanie import PydanticObjectId, SortDirection
from beanie.odm.operators.find.comparison import GTE, LTE, Eq, In
from beanie.odm.operators.find.logical import And, Or

from src.modules.events.schemas import Filters, Pagination, Sort
from src.storages.mongo.events import Event
from src.storages.mongo.selection import Selection


# noinspection PyMethodMayBeStatic
class EventsRepository:
    async def read_one(self, id: PydanticObjectId) -> Event | None:
        return await Event.get(id)

    async def read_all(self) -> list[Event] | None:
        return await Event.all().to_list()

    async def read_all_locations(self) -> list:
        s = await Event.get_motor_collection().aggregate([{"$project": {"location": 1}}]).to_list()
        s = [i["location"] for i in s]
        return s

    async def create_many(self, events: list[Event]) -> bool:
        res = await Event.insert_many(events)
        if not res.acknowledged:
            return False
        return True
    
    async def get_random_event(self) -> Event | None:
        random_docs = await Event.aggregate([
        {"$sample": {"size": 1}}  # Randomly sample one document
    ]).to_list(length=1)
        return random_docs[0] if random_docs else None


    async def read_with_filters(
        self, filters: Filters, sort: Sort, pagination: Pagination, count: bool = False
    ) -> list[Event] | int:
        if filters.by_ids:
            query = Event.find({"_id": {"$in": filters.by_ids}})
            if count:
                return await query.count()
            return await query.to_list()

        query = Event.all()

        # Apply filters
        if filters.age:
            # FIXME: Может работать неверно, если у событий не указан возраст
            filters.age.min = filters.age.min or 0
            filters.age.max = filters.age.max or 100
            query = query.find(
                (filters.age.min <= Event.age_min <= filters.age.max)
                or (filters.age.min <= Event.age_max <= filters.age.max)
                or (filters.age.min >= Event.age_min and Event.age_max <= filters.age.max)
                or (filters.age.min >= Event.age_min and filters.age.max <= Event.age_max)
                or (Event.age_min == None and Event.age_max >= filters.age.min)  # noqa: E711
                or (Event.age_min == None and Event.age_max >= filters.age.max)  # noqa: E711
                or (Event.age_max == None and Event.age_min <= filters.age.min)  # noqa: E711
                or (Event.age_max == None and Event.age_min <= filters.age.max)  # noqa: E711
                or (Event.age_min == None and Event.age_max == None)  # noqa: E711
            )
        if filters.participant_count:
            if filters.participant_count.min is not None and filters.participant_count.max is not None:
                query = query.find(
                    GTE(Event.participant_count, filters.participant_count.min),
                    LTE(Event.participant_count, filters.participant_count.max),
                )
            elif filters.participant_count.min is not None:
                query = query.find(GTE(Event.participant_count, filters.participant_count.min))
            elif filters.participant_count.max is not None:
                query = query.find(LTE(Event.participant_count, filters.participant_count.max))
        if filters.gender is not None:
            query = query.find(Or(Event.gender == filters.gender, Event.gender == None))  # noqa: E711
        if filters.date and filters.date.start_date is not None:
            query = query.find(Event.start_date >= filters.date.start_date)
        if filters.date and filters.date.end_date is not None:
            query = query.find(Event.end_date <= filters.date.end_date)
        if filters.discipline:
            # FIXME: Может работать неверно, если у указанных спортов есть одинаковые названия дисциплин
            query = query.find(In(Event.sport, [discipline.sport for discipline in filters.discipline]))
            if None not in [discipline.discipline for discipline in filters.discipline]:
                query = query.find(In(Event.discipline, [discipline.discipline for discipline in filters.discipline]))

        if filters.location:
            conditions = []
            for loc in filters.location:
                if loc.region is None and loc.city is None:
                    conditions.append(Eq("location.country", loc.country))
                elif loc.city is None:
                    conditions.append(And(Eq("location.country", loc.country), Eq("location.region", loc.region)))
                else:
                    conditions.append(
                        And(
                            Eq("location.country", loc.country),
                            Eq("location.region", loc.region),
                            Eq("location.city", loc.city),
                        )
                    )
            if conditions:
                query = query.find(Or(*conditions))
        if filters.query:
            query = query.find({"$text": {"$search": filters.query}})

        if count:
            return await query.count()

        # Apply sorting
        if sort.date:
            query = query.sort(
                ("start_date", SortDirection.ASCENDING if sort.date == "asc" else SortDirection.DESCENDING)
            )

        if sort.participant_count:
            query = query.sort(
                (
                    "participant_count",
                    SortDirection.ASCENDING if sort.participant_count == "asc" else SortDirection.DESCENDING,
                )
            )

        if sort.age:
            query = query.sort(("age_min", SortDirection.ASCENDING if sort.age == "asc" else SortDirection.DESCENDING))

        # Apply pagination
        query = query.skip(pagination.page_size * (pagination.page_no - 1)).limit(pagination.page_size)

        # Return results
        return await query.to_list()

    async def create_selection(self, filters: Filters, sort: Sort):
        selection = Selection(filters=filters, sort=sort)
        await selection.insert()
        return selection

    async def read_selection(self, id_: PydanticObjectId) -> Selection | None:
        return await Selection.get(id_)


events_repository: EventsRepository = EventsRepository()
