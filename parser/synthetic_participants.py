import datetime
import random
import re
from pprint import pprint

import httpx
import pandas as pd
from russian_names import RussianNames

random.seed(584359081323)

federations = """г. Москва
Белгородская область
Брянская область
Владимирская область
Воронежская область
Ивановская область
Калужская область
Костромская область
Курская область
Липецкая область
Московская область
Орловская область
Рязанская область
Смоленская область
Тамбовская область
Тверская область
Тульская область
Ярославская область
Республика Адыгея
Республика Калмыкия
Краснодарский край
Астраханская область
Волгоградская область
Ростовская область
город Севастополь
Республика Крым
Республика Карелия
Республика Коми
Архангельская область
Калининградская область
Ленинградская область
Мурманская область
Новгородская область
Псковская область
Ненецкий автономный округ
Вологодская область
г. Санкт Петербург
Республика Саха-Якутия
Камчатский край
Приморский край
Хабаровский край
Амурская область
Магаданская область
Республика Бурятия
Забайкальский край
Сахалинская область
Еврейский АО
Чукотский АО
Республика Алтай
Республика Тыва
Республика Хакасия
Алтайский край
Красноярский край
Иркутская область
Кемеровская область - Кузбасс
Новосибирская область
Омская область
Томская область
Курганская область
Свердловская область
Тюменская область
Челябинская область
Ханты-Мансийский автономный округ – Югра
Ямало-Ненецкий АО
Республика Башкортостан
Республика Марий Эл
Республика Мордовия
Республика Татарстан
Удмуртская Республика
Чувашская Республика
Кировская область
Нижегородская область
Оренбургская область
Пензенская область
Пермский край
Самарская область
Саратовская область
Ульяновская область
Республика Дагестан
Республика Ингушетия
Кабардино-Балкарская Республика
Карачаево-Черкесская Республика
Республика Северная Осетия - Алания
Ставропольский край
Чеченская Республика
Донецкая Народная Республика
Луганская Народная Республика
Запорожская область
Херсонская область
""".splitlines()

ranks = [
    "МСМК",
    "МС",
    "КМС",
    "1 разряд",
    "2 разряд",
    "3 разряд",
    "1 юношеский разряд",
    "2 юношеский разряд",
    "3 юношеский разряд",
    None,
]

generated_teams_df = pd.read_csv("generated_teams.csv", index_col=None)
teams_distribution = []  # one-zero-eight, 204 points
for i, row in generated_teams_df.iterrows():
    team: str = row["Команда"]
    member_sub = re.findall(r"\((.*?)\)", team)
    if member_sub:
        team = (
            team.replace(member_sub[-1], "").replace("(", "").replace(")", "").strip()
        )
        members = member_sub[-1].replace("(", "").replace(")", "").split(",")
        members = [m.strip() for m in members]
        members = [m for m in members if m]
    else:
        members = []

    teams_distribution.append((team.strip(), row["Всего баллов"]))


class CustomRussianNames(RussianNames):
    def _get_birth_date(self) -> datetime.date:
        now = datetime.datetime.now()
        # 16-24 years old
        years = random.randint(16, 24)
        birth_date = now.replace(year=now.year - years)
        birth_date = birth_date.replace(
            month=random.randint(1, 12),
            day=random.randint(1, 28),
        )
        return birth_date.date()

    def _get_random_federation(self):
        return random.choice(federations)

    def get_person(self, **kwargs):
        self._set_options(**kwargs)
        gender = self._select_gender_distribution()
        name = self._get_object(gender, "name", self.name_reduction)
        patronymic = self._get_object(gender, "patronymic", self.patronymic_reduction)
        surname = self._get_object(gender, "surname", self.surname_reduction)
        person = {
            "name": name,
            "patronymic": patronymic,
            "surname": surname,
        }
        return dict(
            name=f"{person['surname']} {person['name']} {person['patronymic']}",
            birth_date=self._get_birth_date().isoformat(),
            gender="male" if gender else "female",
            rank=random.choices(
                ranks, weights=[1, 1.25, 1.75, 2, 2, 2, 2, 2, 2, 0.5], k=1
            )[0],
        )


persons = list(
    CustomRussianNames(count=5000, gender=0.75, seed=584359081323).get_batch()
)


def generate_random_lists(elements, num_lists):
    if len(elements) % num_lists != 0:
        raise ValueError(
            "The total number of elements must be divisible by the number of lists."
        )

    # Shuffle the elements to ensure randomness
    random.shuffle(elements)

    # Calculate the size of each list
    list_size = len(elements) // num_lists

    # Generate the lists without overlapping
    random_lists = [
        elements[i * list_size : (i + 1) * list_size] for i in range(num_lists)
    ]

    return random_lists


# generate teams (without overlapping members)
teams: list[dict] = []

for members, (team_name, mean_score) in zip(
    generate_random_lists(persons, 1000), teams_distribution
):
    related_federation = random.choice(federations)
    for member in members:
        member["related_federation"] = related_federation
    teams.append(
        {
            "name": team_name,
            "mean_score": mean_score,
            "members": members,
        }
    )

pprint(teams[0], sort_dicts=False)

our_team = {
    "name": "one-zero-eight",
    "members": [
        {
            "name": "Бельков Руслан Марсельевич",
            "birth_date": datetime.date(2004, 8, 4).isoformat(),
            "gender": "male",
            "related_federation": "Республика Татарстан",
        },
        {
            "name": "Булгаков Артём Сергеевич",
            "birth_date": datetime.date(2004, 9, 5).isoformat(),
            "gender": "male",
            "related_federation": "Республика Татарстан",
        },
        {
            "name": "Авхадеев Альберт Фанисович",
            "birth_date": datetime.date(2003, 10, 6).isoformat(),
            "gender": "male",
            "related_federation": "Республика Татарстан",
        },
        {
            "name": "Дерябкин Владислав Сергеевич",
            "birth_date": datetime.date(2003, 11, 7).isoformat(),
            "gender": "male",
            "related_federation": "Республика Татарстан",
        },
        {
            "name": "Полин Сергей Игоревич",
            "birth_date": datetime.date(2002, 12, 8).isoformat(),
            "gender": "male",
            "related_federation": "Республика Татарстан",
        },
    ],
    "mean_score": 204,
}

persons += our_team["members"]

for p in persons:
    if "related_federation" not in p:
        p["related_federation"] = random.choice(federations)
    else:
        if p["related_federation"] not in federations:
            print(p["related_federation"])

with httpx.Client() as client:
    r = client.post(
        "https://fsp-link-portal.ru/api/users/login",
        params={"login": "admin", "password": "admin108"},
    )
    r.raise_for_status()

    r = client.post(
        "https://fsp-link-portal.ru/api/participants/person/get-by-names/",
        json=[p["name"] for p in persons],
    )
    r.raise_for_status()
    existing_participants: dict[str, dict] = r.json()

    to_create = [p for p in persons if p["name"] not in existing_participants]

    if to_create:
        r = client.post(
            "https://fsp-link-portal.ru/api/participants/person/create-many",
            json=to_create,
            timeout=None,
        )
        r.raise_for_status()

    r = client.post(
        "https://fsp-link-portal.ru/api/participants/person/get-by-names/",
        json=[p["name"] for p in persons],
    )
    r.raise_for_status()
    existing_participants: dict[str, dict] = r.json()

    r = client.get("https://fsp-link-portal.ru/api/events/")
    r.raise_for_status()

    events = r.json()

    r = client.post(
        "https://fsp-link-portal.ru/api/results/for-events",
        json=[e["id"] for e in events],
    )
    r.raise_for_status()

    results = r.json()
    event_id_x_results = {r["event_id"]: r for r in results}

    current = datetime.datetime.now(datetime.UTC)

    before_events = [
        e
        for e in events
        if pd.to_datetime(e["start_date"]) < current and e["status"] == "accredited"
    ]
    has_not_results = [e for e in before_events if e["id"] not in event_id_x_results]
    has_results = [e for e in before_events if e["id"] in event_id_x_results]

    print(f"Total events: {len(events)}")
    print(f"Before events: {len(before_events)}")
    print(f"Events without results: {len(has_not_results)}")

    # Half of before events should be chosen
    count = len(before_events) // 2

    if len(has_results) >= count:
        print("We have enough events with results")
    else:
        to_add = count - len(has_results)
        random_events = random.sample(has_not_results, to_add)
        results = []

        for e in random_events:
            team_count = random.choice([10, 25, 50])
            chosen_teams = random.sample(teams, team_count)
            if random.random() < 0.5:
                chosen_teams += [our_team]
            team_places = []
            for team in chosen_teams:
                team: dict
                team_places.append(
                    {
                        "team": team["name"],
                        "members": [
                            {
                                "id": existing_participants[p["name"]]["id"],
                                "name": p["name"],
                            }
                            for p in team["members"]
                        ],
                        "score": team["mean_score"] + random.randint(-10, 10),
                    }
                )
            team_places.sort(key=lambda x: -x["score"])
            for i, team_place in enumerate(team_places):
                team_place["place"] = i + 1

            results.append(
                {
                    "event_id": e["id"],
                    "event_title": e["title"],
                    "protocols": None,
                    "team_places": team_places,
                    "solo_places": None,
                }
            )

        for result in results:
            r = client.put("https://fsp-link-portal.ru/api/results/", json=result)
            r.raise_for_status()
