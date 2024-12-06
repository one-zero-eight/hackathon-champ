import re
import string

import pandas as pd

disciplines_df = pd.read_csv("disciplines.csv", header=None)


def discipline_to_key(x: str) -> str:
    return x.upper().translate(str.maketrans("", "", string.punctuation + ' –«»""'))


sport_mapping = {}
for sport in disciplines_df[0].unique():
    sport_mapping[sport.upper()] = sport

disciplines_mappind = {}
for sport, sport_disciplines in disciplines_df.groupby(0):
    disciplines_mappind[sport.upper()] = {}
    for d in sport_disciplines[1]:
        # remove punctuation
        disciplines_mappind[sport.upper()][discipline_to_key(d)] = d


def parse_description(df):
    female_re = "(женщины|юниорки|девушки|девочки)"
    male_re = "(мужчины|юниоры|юноши|мальчики)"
    mapping = {}

    for id_, row in df.iterrows():
        # sport_disciplines = disciplines_mappind[row["Спорт"]]
        desc = row["Наименование"]
        splitted = desc.splitlines()
        title = ""
        title_pointer = 0
        for i, line in enumerate(splitted):
            if line.isupper() or line == ")":
                title_pointer = i
                title += " " + line
            else:
                break
        title = title.strip()
        desc = "\n".join(splitted[title_pointer + 1:])
        gender_age = ""
        gender_pointer = title_pointer
        for i, line in enumerate(splitted[title_pointer + 1:], start=title_pointer + 1):
            if line.islower():
                gender_pointer = i
                gender_age += " " + line
            else:
                break
        gender_age = gender_age.strip()

        if re.search(male_re, gender_age, re.IGNORECASE | re.MULTILINE):
            male = True
        else:
            male = False

        if re.search(female_re, gender_age, re.IGNORECASE | re.MULTILINE):
            female = True
        else:
            female = False

        gender = (
            "female"
            if (female and not male)
            else ("male" if male and not female else None)
        )

        ranges = []

        for m in re.finditer(
            r"от ([0-9]+) лет", gender_age, re.IGNORECASE | re.MULTILINE
        ):
            ranges.append((int(m.group(1)), None))

        for m in re.finditer(
            r"до ([0-9]+) лет", gender_age, re.IGNORECASE | re.MULTILINE
        ):
            ranges.append((None, int(m.group(1))))
        for m in re.finditer(
            r"([0-9]+)-([0-9]+) лет", gender_age, re.IGNORECASE | re.MULTILINE
        ):
            ranges.append((int(m.group(1)), int(m.group(2))))

        if ranges:
            age_min = (
                None if any(x is None for x, _ in ranges) else min(x for x, _ in ranges)
            )
            age_max = (
                None if any(x is None for _, x in ranges) else max(x for _, x in ranges)
            )
        else:
            age_min = age_max = None

        disciplines = []
        sport = sport_mapping.get(row["Спорт"].upper(), row["Спорт"].capitalize())

        disciplines_str = " ".join(splitted[gender_pointer + 1:]).strip()
        prepared_disciplines = discipline_to_key(disciplines_str)

        if disciplines_str:
            # now find the discipline
            sports_disciplines = disciplines_mappind.get(row["Спорт"].upper(), {})
            if sports_disciplines:
                for key, discipline in sports_disciplines.items():
                    if key in prepared_disciplines:
                        disciplines.append(discipline)
            else:
                print("sport not found", row["Спорт"])

        mapping[id_] = {
            "title": title,
            "description": desc,
            "gender": gender,
            "age_min": age_min,
            "age_max": age_max,
            "disciplines": disciplines,
            "sport": sport,
        }

    return mapping