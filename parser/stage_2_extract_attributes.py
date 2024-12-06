import json

import pandas as pd

from stage_2_extract_attributes_desc import parse_description
from stage_2_extract_attributes_location import parse_location

pd.set_option("display.max_rows", None)
pd.set_option("display.max_columns", None)
pd.set_option("display.expand_frame_repr", False)

if __name__ == "__main__":
    df = pd.read_csv("events.csv", index_col=0)
    # keep only СПОРТИВНОЕ ПРОГРАММИРОВАНИЕ
    df = df[df["Спорт"] == "СПОРТИВНОЕ ПРОГРАММИРОВАНИЕ"]

    # assert index is unique
    assert df.index.has_duplicates is False

    # > "Сроки"
    assert df["Сроки"].map(lambda x: len(x.splitlines())).unique() == [2]
    # 23.02.2024\n25.02.2024
    df[["Начало", "Конец"]] = df["Сроки"].str.split("\n", expand=True)
    # convert to datetime
    df["Начало"] = pd.to_datetime(df["Начало"], format="%d.%m.%Y")
    df["Конец"] = pd.to_datetime(df["Конец"], format="%d.%m.%Y")
    print(df[["Начало", "Конец"]].head(1))

    # > "Количество участников"
    df["Количество участников"] = df["Количество участников"].astype(int)
    print(df["Количество участников"].head(1))

    # > "Место"
    # replace "ПО НАЗНАЧЕНИЮ" with empty string
    df["Место"] = df["Место"].str.replace(
        r"ПО НАЗНАЧЕНИЮ\s*", "", regex=True, case=False
    )
    # remove leading and trailing whitespaces
    df["Место"] = df["Место"].str.strip()
    location_mapping = parse_location(df)

    # > "Наименование"
    df["Наименование"] = df["Наименование"].str.strip()
    attributes_mapping = parse_description(df)

    # finally, save the results to a json
    _ = []

    for id_, row in df.iterrows():
        _location_mapping = location_mapping[id_]
        _attributes_mapping = attributes_mapping[id_]
        _.append(
            {
                "ekp_id": id_,
                "title": _attributes_mapping["title"],
                "description": _attributes_mapping["description"],
                "gender": _attributes_mapping["gender"],
                "age_min": _attributes_mapping["age_min"],
                "age_max": _attributes_mapping["age_max"],
                # "sport": _attributes_mapping["sport"],
                "discipline": _attributes_mapping["disciplines"],
                "start_date": row["Начало"].strftime("%Y-%m-%d"),
                "end_date": row["Конец"].strftime("%Y-%m-%d"),
                "location": [loc.model_dump() for loc in _location_mapping],
                "participant_count": row["Количество участников"],
                "page": row["Страница"],
            }
        )

    with open("events.json", "w") as f:
        f.write(json.dumps(_, indent=4, ensure_ascii=False))
