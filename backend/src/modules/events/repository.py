__all__ = ["events_repository"]

from beanie import PydanticObjectId
from beanie.odm.operators.find.comparison import GTE, LTE, Eq, In
from beanie.odm.operators.find.logical import And, Nor, Or

from src.modules.events.schemas import (
    Filters,
    Pagination,
    Sort,
    SortingCriteria,
)
from src.storages.mongo.events import Event, EventSchema
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

    async def create_many(self, events: list[EventSchema]) -> bool:
        res = await Event.insert_many([Event.model_validate(event, from_attributes=True) for event in events])
        if not res.acknowledged:
            return False
        return True

    async def suggest(self, event: EventSchema) -> Event:
        return await Event.model_validate(event, from_attributes=True).insert()

    async def accredite(self, id_: PydanticObjectId, status: str, status_comment: str | None) -> Event | None:
        event = await Event.get(id_)
        if event is None:
            return None
        event.status = status
        event.status_comment = status_comment
        await event.save()
        return event

    async def get_random_event(self) -> Event | None:
        random_docs = await Event.aggregate(
            [
                {"$sample": {"size": 1}}  # Randomly sample one document
            ]
        ).to_list(length=1)
        return random_docs[0] if random_docs else None

    async def read_with_filters(
        self, filters: Filters, sort: Sort | None, pagination: Pagination | None, count: bool = False
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

        if filters.date:
            if filters.date.start_date is not None and filters.date.end_date is not None:
                query = query.find(
                    Nor(
                        And(filters.date.start_date < Event.start_date, filters.date.end_date < Event.start_date),
                        And(filters.date.start_date > Event.end_date, filters.date.end_date > Event.end_date),
                    )
                )
            elif filters.date.start_date is not None:
                query = query.find(Event.end_date >= filters.date.start_date)
            elif filters.date.end_date is not None:
                query = query.find(Event.start_date <= filters.date.end_date)

        if filters.date and filters.date.end_date is not None:
            query = query.find(Event.end_date <= filters.date.end_date)
        if filters.discipline:
            query = query.find(In(Event.discipline, filters.discipline))

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

        if filters.host_federation:
            query = query.find({"host_federation": filters.host_federation})

        if filters.query:
            query = query.find({"title": {"$regex": filters.query, "$options": "i"}})

        if count:
            return await query.count()

        if sort:
            if sort.type == SortingCriteria.date:
                query = query.sort(("start_date", sort.direction))
            elif sort.type == SortingCriteria.date:
                query = query.sort(("age_min", sort.direction))
            elif sort.type == SortingCriteria.date:
                query = query.sort(("participant_count", sort.direction))

        if pagination:
            query = query.skip(pagination.page_size * (pagination.page_no - 1)).limit(pagination.page_size)

        # Return results
        return await query.to_list()

    async def read_for_federation(self, federation_id: PydanticObjectId) -> list[Event]:
        return await Event.find({"host_federation": federation_id}).to_list()

    async def read_for_participant(self, name: str) -> list[Event]:
        return await Event.find(
            {
                "$or": [
                    {"results.solo_places.participant": name},
                    {"results.team_places.members": name},
                ]
            }
        ).to_list()

    async def read_for_team(self, name: str) -> list[Event]:
        return await Event.find({"results.team_places.team": name}).to_list()

    async def get_participant_count(self) -> int:
        q = Event.find({"results": {"$ne": None}})
        q = q.aggregate(
            [
                {"$project": {"results": 1}},
            ]
        )
        results = await q.to_list()
        unique_participants = set()
        for result in results:
            for solo_place in result["results"]["solo_places"] or []:
                unique_participants.add(solo_place["participant"])
            for team_place in result["results"]["team_places"] or []:
                for member in team_place["members"]:
                    unique_participants.add(member)
        return len(unique_participants)

    async def create_selection(self, filters: Filters, sort: Sort):
        selection = Selection(filters=filters, sort=sort)
        await selection.insert()
        return selection

    async def read_selection(self, id_: PydanticObjectId) -> Selection | None:
        return await Selection.get(id_)

    async def update(self, id: PydanticObjectId, event: EventSchema) -> Event | None:
        await Event.find_one(Event.id == id).update({"$set": event.model_dump()})
        return await Event.get(id)


events_repository: EventsRepository = EventsRepository()
