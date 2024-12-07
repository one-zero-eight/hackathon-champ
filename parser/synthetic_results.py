import datetime
import random
import re

import httpx
import pandas
import pandas as pd

df = pandas.read_csv("generated_teams.csv", index_col=None)


def sample_winners(count: int) -> pandas.DataFrame:
    # include first with 0.8 probability
    rows = [0]
    # sample the rest
    rows.extend(df.sample(count - len(rows)).index.tolist())
    # remove duplicates
    rows = list(set(rows))
    sampled = df.loc[rows]
    # add or remove some points
    sampled["Всего баллов"] = sampled["Всего баллов"].apply(
        lambda x: x + random.randint(-10, 10)
    )

    # sort by "Всего баллов"
    sampled = sampled.sort_values(by="Всего баллов", ascending=False)
    # copy df
    return sampled.copy()


def get_events():
    """
    [
        {
        "id": "6754b43b5665db36968bc8e0",
        "host_federation": null,
        "status": "on_consideration",
        "status_comment": null,
        "accreditation_comment": null,
        "title": "КУБОК РОССИИ 1 ЭТАП",
        "description": "мужчины от 16 лет и старше\nПРОГРАММИРОВАНИЕ АЛГОРИТМИЧЕСКОЕ",
        "gender": "male",
        "age_min": 16,
        "age_max": null,
        "discipline": [
          "программирование алгоритмическое"
        ],
        "start_date": "2024-04-07T00:00:00Z",
        "end_date": "2024-04-07T00:00:00Z",
        "location": [
          {
            "country": "Россия",
            "region": "ПО МЕСТУ НАХОЖДЕНИЯ УЧАСТНИКОВ",
            "city": null
          }
        ],
        "participant_count": 500,
        "ekp_id": 2101000020025597,
        "page": 1695,
        "results": null,
        "level": null
        }
    ]
    """
    url = "https://champ.innohassle.ru/api/events/"

    response = httpx.get(url)
    response.raise_for_status()
    return response.json()


def main():
    events = get_events()

    current = datetime.datetime.now(datetime.UTC)

    before_events = [e for e in events if pd.to_datetime(e["start_date"]) < current]
    has_not_results = [e for e in before_events if e["results"] is None]
    has_results = [e for e in before_events if e["results"] is not None]

    print(f"Total events: {len(events)}")
    print(f"Before events: {len(before_events)}")
    print(f"Events without results: {len(has_not_results)}")

    # Half of before events should be chosen
    count = len(before_events) // 2

    if len(has_results) >= count:
        print("We have enough events with results")
        return

    to_add = count - len(has_results)

    # get random from has not results
    random_events = random.sample(has_not_results, to_add)

    for e in random_events:
        winners_count = random.choice([50, 100, 200])
        winners = sample_winners(winners_count)
        team_places = []
        for i, row in winners.iterrows():
            team: str = row[
                "Команда"
            ]  # one-zero-eight (Булгаков, Авхадеев, Бельков, Дерябкин, Полин)
            member_sub = re.findall(r"\((.*?)\)", team)
            if member_sub:
                team = (
                    team.replace(member_sub[-1], "")
                    .replace("(", "")
                    .replace(")", "")
                    .strip()
                )
                members = member_sub[-1].replace("(", "").replace(")", "").split(",")
                members = [m.strip() for m in members]
                members = [m for m in members if m]
            else:
                members = []

            team_places.append(
                dict(
                    place=len(team_places) + 1,
                    team=team.strip(),
                    members=members,
                    score=row["Всего баллов"],
                )
            )

        e["results"] = {
            "protocols": None,
            "team_places": team_places,
            "solo_places": None,
        }

    with httpx.Client() as client:
        r = client.post(
            "https://champ.innohassle.ru/api/users/login",
            params={"login": "admin", "password": "admin108"},
        )
        r.raise_for_status()
        for e in random_events:
            r = client.put(f"https://champ.innohassle.ru/api/events/{e['id']}", json=e)
            r.raise_for_status()


if __name__ == "__main__":
    main()
