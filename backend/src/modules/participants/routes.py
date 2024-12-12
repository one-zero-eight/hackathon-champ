from collections import Counter, defaultdict

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException

from src.modules.participants.repository import participant_repository
from src.modules.results.repository import result_repository
from src.pydantic_base import BaseSchema
from src.storages.mongo import Participant
from src.storages.mongo.results import SoloPlace, TeamPlace

router = APIRouter(prefix="/participants", tags=["Participants"])


class Participation(BaseSchema):
    result_id: PydanticObjectId
    event_id: PydanticObjectId
    event_title: str
    solo_place: SoloPlace | None = None
    team_place: TeamPlace | None = None


class ParticipantStats(BaseSchema):
    id: PydanticObjectId
    "ID участника"
    name: str
    "ФИО участника"
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
    return await result_repository.get_participant_count()


@router.get("/person/hint")
async def get_participant_hint(name: str) -> list[Participant | str]:
    if not name:
        return []

    participants_in_registry = await Participant.find({"name": {"$regex": name, "$options": "i"}}).to_list(10)
    return participants_in_registry


@router.get(
    "/person/get/{id}",
    responses={200: {"description": "Info about participant"}, 404: {"description": "Participant not found"}},
)
async def get_participant(id: PydanticObjectId) -> Participant:
    participant = await Participant.get(id)
    if participant is None:
        raise HTTPException(status_code=404, detail="Participant not found")
    return participant


@router.get(
    "/person/stats/{id}",
    responses={200: {"description": "Stats about participant"}, 404: {"description": "Participant not found"}},
)
async def get_participant_stats(id: PydanticObjectId) -> ParticipantStats:
    participant = await Participant.get(id)

    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    results = await result_repository.read_for_participant(participant_id=id)

    participations = []
    for result in results:
        participations.append(
            Participation(
                result_id=result.id,
                event_id=result.event_id,
                event_title=result.event_title,
                solo_place=next((p for p in result.solo_places or [] if p.participant.id == id), None),
                team_place=next((p for p in result.team_places or [] if p.participant.id == id), None),
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
        id=id,
        name=participant.name,
        participations=participations,
        total=total,
        golds=golds,
        silvers=silvers,
        bronzes=bronzes,
    )


@router.get("/person/stats/all")
async def get_all_participants_stats(limit: int = 100, skip: int = 0) -> list[tuple[int, ParticipantStats]]:
    """
    Список статистик участников: список кортежей (место в рейтинге, ParticipantStats)
    """

    results = await result_repository.read_all()
    total = Counter()
    golds = Counter()
    silvers = Counter()
    bronzes = Counter()
    participations = defaultdict(list)

    for result in results:
        for solo in result.solo_places or []:
            if not solo.participant.id:
                continue
            key_ = solo.participant.id
            total[key_] += 1
            if solo.place == 1:
                golds[key_] += 1
            elif solo.place == 2:
                silvers[key_] += 1
            elif solo.place == 3:
                bronzes[key_] += 1
            participations[key_].append(
                Participation(
                    result_id=result.id,
                    event_id=result.event_id,
                    event_title=result.event_title,
                    solo_place=solo,
                )
            )

        for team in result.team_places or []:
            for member in team.members:
                if not member.id:
                    continue
                key_ = member.id
                total[key_] += 1
                if team.place == 1:
                    golds[key_] += 1
                elif team.place == 2:
                    silvers[key_] += 1
                elif team.place == 3:
                    bronzes[key_] += 1
                participations[key_].append(
                    Participation(
                        result_id=result.id,
                        event_id=result.event_id,
                        event_title=result.event_title,
                        team_place=team,
                    )
                )
    participant_in_registry = await participant_repository.read_all()
    id_to_name = {p.id: p.name for p in participant_in_registry}

    participants = [
        ParticipantStats(
            id=id,
            name=id_to_name.get(id, ""),
            participations=participations[id],
            total=total[id],
            golds=golds[id],
            silvers=silvers[id],
            bronzes=bronzes[id],
        )
        for id in total
    ]

    def score(p: ParticipantStats):
        return p.golds, p.silvers, p.bronzes, p.total

    participants.sort(key=lambda p: (*score(p), p.name), reverse=True)

    # same score should have the same place
    place = 1
    places = []
    for i in range(len(participants)):
        if i > 0 and score(participants[i]) != score(participants[i - 1]):
            place = i + 1
        places.append(place)

    return list(zip(places, participants[skip : skip + limit]))


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
    results = await result_repository.read_for_team(name)

    participations = []
    for result in results:
        participations.append(
            Participation(
                result_id=result.id,
                event_id=result.event_id,
                event_title=result.event_title,
                team_place=next((p for p in result.team_places or [] if p.team == name), None),
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
async def get_all_teams(limit: int = 100, skip: int = 0) -> list[tuple[int, TeamStats]]:
    """
    Список статистик команд: список кортежей (место в рейтинге, ParticipantStats)
    """
    results = await result_repository.read_all()
    total = Counter()
    golds = Counter()
    silvers = Counter()
    bronzes = Counter()
    participations = defaultdict(list)

    for result in results:
        for team in result.team_places or []:
            total[team.team] += 1
            if team.place == 1:
                golds[team.team] += 1
            elif team.place == 2:
                silvers[team.team] += 1
            elif team.place == 3:
                bronzes[team.team] += 1
            participations[team.team].append(
                Participation(
                    result_id=result.id,
                    event_id=result.event_id,
                    event_title=result.event_title,
                    team_place=team,
                )
            )

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

    def score(t: TeamStats):
        return t.golds, t.silvers, t.bronzes, t.total

    teams.sort(key=lambda t: (*score(t), t.name), reverse=True)

    # same score should have the same place
    place = 1
    places = []
    for i in range(len(teams)):
        if i > 0 and score(teams[i]) != score(teams[i - 1]):
            place = i + 1
        places.append(place)

    return list(zip(places, teams))[skip : skip + limit]
