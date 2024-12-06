from collections import defaultdict
from itertools import pairwise

import pandas as pd
from pydantic import BaseModel

countries = pd.read_csv("country.csv", index_col=0, delimiter=";")

# country_id index, name
rename = {
    "ОБЪЕДИНЕННЫЕ АРАБСКИЕ ЭМИРАТЫ": "О.А.Э.",
    "КОРЕЯ, РЕСПУБЛИКА": "Южная Корея",
    "ИРАН (ИСЛАМСКАЯ РЕСПУБЛИКА)": "Иран",
    "СОЕДИНЕННОЕ КОРОЛЕВСТВО": "Великобритания",
    "ТАЙВАНЬ (КИТАЙ)": "Тайвань",
    "ТАИЛАНД": "Тайланд",
    "МАРОККО": "Морокко",
    "ЮЖНАЯ АФРИКА": "ЮАР",
    "СЕВЕРНАЯ МАКЕДОНИЯ": "Македония",
    "СОЕДИНЕННЫЕ ШТАТЫ": "США",
    "КИРГИЗИЯ": "Киргызстан",
    "ЧЕРНОГОРИЯ": "Югославия",
}
for to, from_ in rename.items():
    countries["name"] = countries["name"].str.replace(from_, to)

inverse_index_countries: dict = dict(
    zip(map(str.upper, countries["name"]), countries.index)
)

extra = {
    "СЕРБИЯ": None,
    "БОСНИЯ И ГЕРЦЕГОВИНА": None,
    "ВЕНЕСУЭЛА (БОЛИВАРИАНСКАЯ РЕСПУБЛИКА)": None,
    "САУДОВСКАЯ АРАВИЯ": None,
    "КЕНИЯ": None,
    "ФИЛИППИНЫ": None,
    "АБХАЗИЯ": None,
    "АЛБАНИЯ": None,
    "КАТАР": None,
    "БАХРЕЙН": None,
    "УРУГВАЙ": None,
    "ОМАН": None,
    "ШРИ-ЛАНКА": None,
    "ЮЖНАЯ ОСЕТИЯ": None,
    "БАНГЛАДЕШ": None,
    "АЛЖИР": None,
}
# add extra countries
for country_, same_as in extra.items():
    if same_as:
        inverse_index_countries[country_] = inverse_index_countries[same_as]
    else:
        # add new country
        inverse_index_countries[country_] = countries.index.max() + 1


class Location(BaseModel):
    country: str
    region: str | None = None
    city: str | None = None


def parse_location(df):
    locations_mapping = defaultdict(list)
    for id_, place_strings in df["Место"].str.split("\n").items():
        if not place_strings:
            continue
        if not place_strings[0] and len(place_strings) == 1:
            continue

        detected_countries = {}
        for j, place in enumerate(place_strings):
            if place in inverse_index_countries:
                detected_countries[j] = place

        locations = []

        if detected_countries == {0: "РОССИЯ"}:
            # ['РОССИЯ', 'КРАСНОЯРСКИЙ КРАЙ, г. Красноярск']
            # ['РОССИЯ', 'Г. МОСКВА, Город Москва']
            # ['РОССИЯ', 'Г. САНКТ-ПЕТЕРБУРГ, Город Санкт-Петербург', 'Г. МОСКВА, Город Москва']
            # ['РОССИЯ', 'КЕМЕРОВСКАЯ ОБЛАСТЬ, Журавлево село, поселок городского', 'типа Шерегеш']
            new = []
            skip = False

            for place, next_place in pairwise(place_strings + [None]):
                if skip:
                    skip = False
                    continue
                if (
                    next_place
                    and place.endswith("городского")
                    and next_place.startswith("типа")
                ) or (
                    next_place
                    and place.endswith("поселок")
                    and next_place.startswith("городского типа")
                ):
                    place += " " + next_place
                    skip = True
                new.append(place)

            if len(new) == 1:
                locations.append(Location(country="Россия"))
            else:
                for place in new[1:]:
                    splitted = list(map(str.strip, place.split(",")))
                    splitted = list(filter(None, splitted))
                    if len(splitted) == 2:
                        locations.append(
                            Location(
                                country="Россия", region=splitted[0], city=splitted[1]
                            )
                        )
                    elif len(splitted) == 1:
                        if splitted[0].isupper():
                            locations.append(
                                Location(country="Россия", region=splitted[0])
                            )
                        else:
                            locations.append(
                                Location(country="Россия", city=splitted[0])
                            )
                    else:
                        # may be several regions (uppercase)
                        # may be several cities (not uppercase)
                        # may be region and several cities
                        if all(x.isupper() for x in splitted):
                            for region in splitted:
                                locations.append(
                                    Location(country="Россия", region=region)
                                )
                        elif all(not x.isupper() for x in splitted):
                            for city in splitted:
                                locations.append(Location(country="Россия", city=city))
                        elif splitted[0].isupper() and all(
                            not x.isupper() for x in splitted[1:]
                        ):
                            region = splitted[0]
                            for city in splitted[1:]:
                                locations.append(
                                    Location(country="Россия", region=region, city=city)
                                )
                        else:
                            print(id_, place_strings)
        elif len(detected_countries) == 1:
            _, country = detected_countries.popitem()
            if len(place_strings) == 1:
                locations.append(Location(country=country))
            else:
                for place in place_strings[1:]:
                    locations.append(Location(country=country, city=place))
        elif len(detected_countries) > 1:
            # group in such way [country 1, region, city, country 2, region, ...] -> [[country 1, region, city], [country 2, region, ...]]
            _ = list(detected_countries.keys())
            # add last index
            _.append(len(place_strings))
            # add first index
            _.insert(0, 0)
            # group by pairs
            for start, end in pairwise(_):
                if start == end:
                    continue
                country = detected_countries[start]
                if end - start == 1:
                    locations.append(Location(country=country))
                else:
                    for place in place_strings[start + 1 : end]:
                        locations.append(Location(country=country, city=place))

        for loc in locations:
            loc.country = loc.country.capitalize()

            if loc.region:
                loc.region = loc.region.strip(",")
            if loc.city:
                loc.city = loc.city.strip(",")

        locations_mapping[id_] = locations
    return locations_mapping
