from collections import Counter, defaultdict

from beanie import PydanticObjectId
from fastapi import APIRouter

from src.modules.events.repository import events_repository
from src.pydantic_base import BaseSchema
from src.storages.mongo.events import SoloPlace, TeamPlace

router = APIRouter(prefix="/participants", tags=["Participants"])


class Participation(BaseSchema):
    event_id: PydanticObjectId
    event_title: str
    solo_place: SoloPlace | None = None
    team_place: TeamPlace | None = None


class ParticipantStats(BaseSchema):
    name: str
    "Имя участника"
    participations: list[Participation]
    "Участия"
    total: int = 0
    "Общее количество участий"
    golds: int = 0
    "Общее количество золотых медалей"
    silvers: int = 0
    "Общее количество серебрянных медалей"
    bronzes: int = 0
    "Общее количество бронзовых медалей"


@router.get("/person/count")
async def get_participant_count() -> int:
    return await events_repository.get_participant_count()


@router.get("/person/")
async def get_participant(name: str) -> ParticipantStats:
    if not name:
        return ParticipantStats(name=name, participations=[])

    events = await events_repository.read_for_participant(name)

    participations = []
    for event in events:
        participations.append(
            Participation(
                event_id=event.id,
                event_title=event.title,
                solo_place=next((p for p in event.results.solo_places or [] if p.participant == name), None),
                team_place=next((p for p in event.results.team_places or [] if name in p.members), None),
            )
        )

    total = len(participations)
    golds = sum(1 for p in participations if p.solo_place and p.solo_place.place == 1)
    silvers = sum(1 for p in participations if p.solo_place and p.solo_place.place == 2)
    bronzes = sum(1 for p in participations if p.solo_place and p.solo_place.place == 3)
    golds += sum(1 for p in participations if p.team_place and p.team_place.place == 1)
    silvers += sum(1 for p in participations if p.team_place and p.team_place.place == 2)
    bronzes += sum(1 for p in participations if p.team_place and p.team_place.place == 3)

    return ParticipantStats(
        name=name,
        participations=participations,
        total=total,
        golds=golds,
        silvers=silvers,
        bronzes=bronzes,
    )


@router.get("/person/all")
async def get_all_participants(limit: int = 100) -> list[ParticipantStats]:
    events = await events_repository.read_all()
    total = Counter()
    golds = Counter()
    silvers = Counter()
    bronzes = Counter()
    participations = defaultdict(list)

    for event in events:
        if not event.results:
            continue
        for solo in event.results.solo_places or []:
            total[solo.participant] += 1
            if solo.place == 1:
                golds[solo.participant] += 1
            elif solo.place == 2:
                silvers[solo.participant] += 1
            elif solo.place == 3:
                bronzes[solo.participant] += 1
            participations[solo.participant].append(
                Participation(event_id=event.id, event_title=event.title, solo_place=solo)
            )

        for team in event.results.team_places or []:
            for member in team.members:
                total[member] += 1
                if team.place == 1:
                    golds[member] += 1
                elif team.place == 2:
                    silvers[member] += 1
                elif team.place == 3:
                    bronzes[member] += 1
                participations[member].append(
                    Participation(event_id=event.id, event_title=event.title, team_place=team)
                )

    participants = [
        ParticipantStats(
            name=name,
            participations=participations[name],
            total=total[name],
            golds=golds[name],
            silvers=silvers[name],
            bronzes=bronzes[name],
        )
        for name in total
        if name
    ]

    participants.sort(key=lambda p: (p.golds, p.silvers, p.bronzes, p.total, p.name), reverse=True)

    return participants[:limit]


class TeamStats(BaseSchema):
    name: str
    "Название команды"
    participations: list[Participation]
    "Участия"
    total: int = 0
    "Общее количество участий"
    golds: int = 0
    "Общее количество золотых медалей"
    silvers: int = 0
    "Общее количество серебрянных медалей"
    bronzes: int = 0
    "Общее количество бронзовых медалей"


@router.get("/team/")
async def get_team(name: str):
    if not name:
        return TeamStats(name=name, participations=[])
    events = await events_repository.read_for_team(name)

    participations = []
    for event in events:
        participations.append(
            Participation(
                event_id=event.id,
                event_title=event.title,
                team_place=next((p for p in event.results.team_places or [] if p.team == name), None),
            )
        )

    total = len(participations)
    golds = sum(1 for p in participations if p.team_place and p.team_place.team == name and p.team_place.place == 1)
    silvers = sum(1 for p in participations if p.team_place and p.team_place.team == name and p.team_place.place == 2)
    bronzes = sum(1 for p in participations if p.team_place and p.team_place.team == name and p.team_place.place == 3)

    return TeamStats(
        name=name,
        participations=participations,
        total=total,
        golds=golds,
        silvers=silvers,
        bronzes=bronzes,
    )


@router.get("/team/all")
async def get_all_teams() -> list[TeamStats]:
    events = await events_repository.read_all()
    total = Counter()
    golds = Counter()
    silvers = Counter()
    bronzes = Counter()
    participations = defaultdict(list)

    for event in events:
        if not event.results:
            continue
        for team in event.results.team_places or []:
            total[team.team] += 1
            if team.place == 1:
                golds[team.team] += 1
            elif team.place == 2:
                silvers[team.team] += 1
            elif team.place == 3:
                bronzes[team.team] += 1
            participations[team.team].append(Participation(event_id=event.id, event_title=event.title, team_place=team))

    teams = [
        TeamStats(
            name=team,
            participations=participations[team],
            total=total[team],
            golds=golds[team],
            silvers=silvers[team],
            bronzes=bronzes[team],
        )
        for team in total
        if team
    ]

    teams.sort(key=lambda t: (t.golds, t.silvers, t.bronzes, t.total, t.name), reverse=True)

    return teams
