import argparse
import json
from datetime import datetime
from typing import List, Optional, Dict
import re
from natasha import (
    Segmenter,
    MorphVocab,
    NewsEmbedding,
    NewsMorphTagger,
    NewsSyntaxParser,
    NewsNERTagger,
    Doc,
    DatesExtractor,
    MoneyExtractor,
    AddrExtractor,
)

# Initialize Natasha's components
segmenter = Segmenter()
morph_vocab = MorphVocab()
emb = NewsEmbedding()
morph_tagger = NewsMorphTagger(emb)
syntax_parser = NewsSyntaxParser(emb)
ner_tagger = NewsNERTagger(emb)
dates_extractor = DatesExtractor(morph_vocab)
money_extractor = MoneyExtractor(morph_vocab)
addr_extractor = AddrExtractor(morph_vocab)


class Event:
    def __init__(self):
        self.title: str = ""
        self.description: Optional[str] = None
        self.age_min: Optional[int] = None
        self.age_max: Optional[int] = None
        self.discipline: List[str] = []
        self.start_date: Optional[str] = None
        self.end_date: Optional[str] = None
        self.location: List[Dict[str, Optional[str]]] = []
        self.participant_count: Optional[int] = None

    def to_dict(self) -> dict:
        return {
            "title": self.title,
            "description": self.description,
            "age_min": self.age_min,
            "age_max": self.age_max,
            "discipline": self.discipline,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "location": self.location,
            "participant_count": self.participant_count,
        }


def extract_age_range(text: str) -> tuple[Optional[int], Optional[int]]:
    """Extract age range from text using Natasha NLP."""
    doc = Doc(text)
    doc.segment(segmenter)
    doc.tag_morph(morph_tagger)

    text_lower = text.lower()

    # First check for team size mentions (these are not age ranges)
    team_size_patterns = [
        r"команд[а-я]*\s+(?:из|по|численностью)\s+\d+-\d+",
        r"состав[а-я]*\s+(?:из|по)\s+\d+-\d+",
    ]

    for pattern in team_size_patterns:
        if re.search(pattern, text_lower):
            continue  # Skip these matches as they're about team size, not age

    # Common patterns for age ranges
    age_patterns = [
        r"(?:от\s+)?(\d+)(?:\s*-\s*|\s+до\s+)(\d+)(?:\s+лет)?",
        r"(?:в\s+возрасте\s+)?(\d+)\s*-\s*(\d+)\s+лет",
        r"возраст[а-я]*\s+(?:от\s+)?(\d+)(?:\s*-\s*|\s+до\s+)(\d+)",
        r"для\s+(?:участников|детей|школьников|ребят)\s+(?:от\s+)?(\d+)(?:\s*-\s*|\s+до\s+)(\d+)",
        r"(\d+)\+",
        r"старше\s+(\d+)",
        r"от\s+(\d+)\s+лет",
        r"достигших\s+(\d+)",
        r"возраст[а-я]*\s+(\d+)\+",
    ]

    # First try to find explicit age ranges
    for pattern in age_patterns:
        match = re.search(pattern, text_lower)
        if match:
            if len(match.groups()) == 2:
                age1, age2 = int(match.group(1)), int(match.group(2))
                # Validate the age range
                if 5 <= age1 <= 100 and 5 <= age2 <= 100:  # Reasonable age limits
                    return min(age1, age2), max(age1, age2)
            else:
                age = int(match.group(1))
                if 5 <= age <= 100:  # Reasonable age limit
                    if "+" in pattern or "старше" in pattern or "от" in pattern:
                        return age, None
                    return age, age

    # Use Natasha's morphological analysis to find age-related words
    age_related_words = {
        "школьник": (14, 18),
        "студент": (17, 25),
        "молодежь": (14, 35),
        "юниор": (14, 18),
        "взрослый": (18, None),
    }

    # Look for age-related words in the text
    for token in doc.tokens:
        if token.pos == "NOUN" and token.lemma in age_related_words:
            return age_related_words[token.lemma]

    # Context-based inference
    if "хакатон" in text_lower or "продуктовое программирование" in text_lower:
        if "талантлив" in text_lower and "спортсмен" in text_lower:
            return 14, None
        return 16, None
    elif "алгоритмическое программирование" in text_lower:
        if "школьник" in text_lower:
            return 14, 18
        elif "студент" in text_lower:
            return 17, 25
        return 14, None

    return None, None


def extract_date(text: str) -> Optional[str]:
    """Extract date from text using Natasha's DatesExtractor."""
    doc = Doc(text)
    doc.segment(segmenter)

    # Convert generator to list
    matches = list(dates_extractor(text))

    if matches:
        # Get the first date mention
        match = matches[0]
        date_value = match.fact

        # Convert to datetime and ISO format
        try:
            # Check if we have a complete date
            if (
                getattr(date_value, "year", None) is not None
                and getattr(date_value, "month", None) is not None
                and getattr(date_value, "day", None) is not None
            ):
                return datetime(
                    date_value.year, date_value.month, date_value.day
                ).isoformat()
        except (ValueError, AttributeError):
            pass

    # Fallback to regex patterns if Natasha doesn't find dates
    patterns = [
        r"(\d{4})-(\d{2})-(\d{2})",
        r"(\d{2})\.(\d{2})\.(\d{4})",
        r"(\d{1,2})\s+(янв(?:аря)?|фев(?:раля)?|мар(?:та)?|апр(?:еля)?|мая|июн(?:я)?|июл(?:я)?|авг(?:уста)?|сен(?:тября)?|окт(?:ября)?|ноя(?:бря)?|дек(?:абря)?)\s+(\d{4})",
    ]

    months = {
        "янв": 1,
        "фев": 2,
        "мар": 3,
        "апр": 4,
        "май": 5,
        "июн": 6,
        "июл": 7,
        "авг": 8,
        "сен": 9,
        "окт": 10,
        "ноя": 11,
        "дек": 12,
    }

    text_lower = text.lower()
    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            try:
                if len(match.groups()) == 3:
                    if match.group(2) in months or match.group(2)[:3] in months:
                        day = int(match.group(1))
                        month = months.get(match.group(2)[:3], 1)
                        year = int(match.group(3))
                    else:
                        year = int(match.group(1))
                        month = int(match.group(2))
                        day = int(match.group(3))
                    return datetime(year, month, day).isoformat()
            except (ValueError, IndexError):
                continue

    return None


def normalize_location_name(name: str) -> str:
    """Normalize location name by removing case endings and standardizing format."""
    # Remove common case endings
    endings = [
        "ого",
        "его",
        "ому",
        "ему",
        "ой",
        "ей",
        "ом",
        "ем",
        "ая",
        "яя",
        "ую",
        "юю",
        "ые",
        "ие",
        "ый",
        "ий",
    ]
    name_lower = name.lower()

    # Skip normalization for known city names
    city_mapping = {
        "мск": "Москва",
        "спб": "Санкт-Петербург",
        "питер": "Санкт-Петербург",
        "калининградск": "Калининград",
        "московск": "Москва",
        "севастопольск": "Севастополь",
    }

    for key, value in city_mapping.items():
        if name_lower.startswith(key):
            return value

    # Remove case endings
    for ending in endings:
        if name_lower.endswith(ending):
            name = name[: -len(ending)]
            break

    # Capitalize first letter of each word
    words = name.lower().split()
    name = " ".join(word.capitalize() for word in words)

    return name.strip()


def is_valid_location(text: str, location_type: str) -> bool:
    """Check if the text is a valid location name."""
    # Words that should not be considered locations
    invalid_words = {
        "соревнование",
        "тестеры",
        "региональное",
        "федерация",
        "время",
        "времени",
        "область",
        "край",
        "республика",
        "округ",
        "регион",
        "тип",
        "формат",
        "россии",
        "рф",
        "российской",
        "российская",
        "россия",  # Country names should be handled separately
    }

    text_lower = text.lower()

    # Check if it's in the invalid words list
    if text_lower in invalid_words:
        return False

    # Check if it's a time zone reference
    if "время" in text_lower or "времени" in text_lower:
        return False

    # For cities, check minimum length and avoid common false positives
    if location_type == "city":
        if len(text) < 3:  # Too short to be a city name
            return False
        if text_lower.endswith("ское") or text_lower.endswith("��й"):
            return False
        if text_lower.endswith("ский") or text_lower.endswith("ская"):
            return False
        if text_lower.startswith("по ") or text_lower.startswith("в "):
            return False

    return True


def extract_location(text: str) -> List[Dict[str, Optional[str]]]:
    """Extract location information using Natasha NER."""
    doc = Doc(text)
    doc.segment(segmenter)
    doc.tag_ner(ner_tagger)

    locations = []
    text_lower = text.lower()

    # Check for online/offline format first
    if "онлайн" in text_lower:
        return [{"country": "Россия", "region": None, "city": "Онлайн"}]

    # Common location patterns
    location_patterns = {
        "city": [
            r"(?:г\.|город)\s*([А-Я][а-я]+(?:-[А-Я][а-я]+)*)",
            r"в\s+(?:городе\s+)?([А-Я][а-я]+(?:-[А-Я][а-я]+)*)",
            r"пройд[её]т\s+в\s+(?:городе\s+)?([А-Я][а-я]+(?:-[А-Я][а-я]+)*)",
            r"состоится\s+в\s+(?:городе\s+)?([А-Я][а-я]+(?:-[А-Я][а-я]+)*)",
            r"адрес[у]?\s*:\s*(?:г\.)?\s*([А-Я][а-я]+(?:-[А-Я][а-я]+)*)",
            r"по\s+адресу\s*(?:г\.)?\s*([А-Я][а-я]+(?:-[А-Я][а-я]+)*)",
        ],
        "region": [
            r"(?:обл(?:асть)?|край|республика|округ)\s+([А-Я][а-я]+(?:-[А-Я][а-я]+)*)",
            r"([А-Я][а-я]+(?:-[А-Я][а-я]+)*)\s+(?:обл(?:асть)?|край|республика|округ)",
            r"([А-Я][а-я]+(?:-[А-Я][а-я]+)*)\s+региона?",
            r"региона?\s+([А-Я][а-я]+(?:-[А-Я][а-я]+)*)",
        ],
    }

    # Known cities and their regions
    known_cities = {
        "москва": ("Россия", "Московская область", "Москва"),
        "санкт-петербург": ("Россия", "Ленинградская область", "Санкт-Петербург"),
        "калининград": ("Россия", "Калининградская область", "Калининград"),
        "севастополь": ("Россия", None, "Севастополь"),
        "новосибирск": ("Россия", "Новосибирская область", "Новосибирск"),
        "екатеринбург": ("Россия", "Свердловская область", "Екатеринбург"),
        "казань": ("Россия", "Республика Татарстан", "Казань"),
        "нижний новгород": ("Россия", "Нижегородская область", "Нижний Новгород"),
        "челябинск": ("Россия", "Челябинская область", "Челябинск"),
        "омск": ("Россия", "Омская область", "Омск"),
        "самара": ("Россия", "Самарская область", "Самара"),
        "ростов-на-дону": ("Россия", "Ростовская область", "Ростов-на-Дону"),
        "уфа": ("Россия", "Республика Башкортостан", "Уфа"),
        "красноярск": ("Россия", "Кра��ноярский край", "Красноярск"),
        "воронеж": ("Россия", "Воронежская область", "Воронеж"),
        "пермь": ("Россия", "Пермский край", "Пермь"),
        "волгоград": ("Россия", "Волгоградская область", "Волгоград"),
    }

    # First try using addr_extractor
    matches = addr_extractor(text)
    if matches:
        for match in matches:
            addr = match.fact
            location = {"country": None, "region": None, "city": None}

            if hasattr(addr, "country"):
                location["country"] = addr.country
            if hasattr(addr, "region"):
                region = getattr(addr, "region")
                if region and is_valid_location(region, "region"):
                    location["region"] = normalize_location_name(region)
            if hasattr(addr, "city"):
                city = getattr(addr, "city")
                if city and is_valid_location(city, "city"):
                    location["city"] = normalize_location_name(city)

            if any(location.values()):
                locations.append(location)

    # If no locations found with addr_extractor, try patterns and NER
    if not locations:
        current_location = {"country": None, "region": None, "city": None}

        # Try to find cities using patterns
        for pattern in location_patterns["city"]:
            match = re.search(pattern, text)
            if match:
                city = match.group(1).strip()
                if city and is_valid_location(city, "city"):
                    normalized_city = normalize_location_name(city)
                    normalized_city_lower = normalized_city.lower()
                    if normalized_city_lower in known_cities:
                        country, region, city = known_cities[normalized_city_lower]
                        current_location["country"] = country
                        if region:
                            current_location["region"] = region
                        current_location["city"] = city
                    else:
                        current_location["city"] = normalized_city
                    break

        # Try to find regions using patterns
        for pattern in location_patterns["region"]:
            match = re.search(pattern, text)
            if match:
                region = match.group(1).strip()
                if region and is_valid_location(region, "region"):
                    current_location["region"] = normalize_location_name(region)
                    break

        # Use NER for additional location detection
        for span in doc.spans:
            if span.type == "LOC":
                text = span.text
                text_lower = text.lower()

                # Skip already found locations
                if current_location["city"] and text == current_location["city"]:
                    continue
                if current_location["region"] and text == current_location["region"]:
                    continue

                # Check if it's a known city
                normalized_text = normalize_location_name(text)
                normalized_text_lower = normalized_text.lower()

                if normalized_text_lower in known_cities:
                    country, region, city = known_cities[normalized_text_lower]
                    current_location["country"] = country
                    if region:
                        current_location["region"] = region
                    current_location["city"] = city
                    continue

                # Determine location type
                if any(
                    word in text_lower
                    for word in ["область", "край", "республика", "округ", "регион"]
                ):
                    if not current_location["region"] and is_valid_location(
                        text, "region"
                    ):
                        current_location["region"] = normalize_location_name(text)
                elif "россия" in text_lower or "рф" in text_lower:
                    current_location["country"] = "Россия"
                else:
                    if not current_location["city"] and is_valid_location(text, "city"):
                        current_location["city"] = normalize_location_name(text)

        # Set default country for Russian cities/regions
        if (
            current_location["city"] or current_location["region"]
        ) and not current_location["country"]:
            current_location["country"] = "Россия"

        # Add location if we found any information
        if any(current_location.values()):
            locations.append(current_location)

    # If still no locations found but we have time zone information
    if not locations:
        tz_patterns = {
            r"(?:по|время)\s+(?:мск|московскому)": (
                "Россия",
                "Московская область",
                "Москва",
            ),
            r"(?:по|время)\s+калининградскому": (
                "Россия",
                "Калининградская область",
                "Калининград",
            ),
        }

        for pattern, (country, region, city) in tz_patterns.items():
            if re.search(pattern, text_lower):
                locations.append({"country": country, "region": region, "city": city})
                break

    return locations


def extract_disciplines(text: str) -> List[str]:
    """Extract programming disciplines using Natasha NLP."""
    doc = Doc(text)
    doc.segment(segmenter)
    doc.tag_morph(morph_tagger)

    disciplines = []
    text_lower = text.lower()

    # First check for explicit discipline mentions in title
    title_match = re.search(r'(?:в\s+)?дисциплин[а-я]*\s+[«"]([^»"]+)[»"]', text)
    if title_match:
        discipline_name = title_match.group(1).strip().lower()
        if "продуктов" in discipline_name:
            disciplines.append("продуктовое программирование")
        elif "алгоритм" in discipline_name:
            disciplines.append("алгоритмическое программирование")
        elif "безопасност" in discipline_name:
            disciplines.append("программирование систем информационной безопасности")
        elif "робот" in discipline_name:
            disciplines.append("программирование робото��ехники")
        elif "беспилот" in discipline_name or "бпла" in discipline_name:
            disciplines.append("программирование беспилотных авиационных систем")

    # Check for discipline patterns
    discipline_patterns = {
        "алгоритмическое программирование": [
            r"алгоритмическ[а-я]+\s+программирован[а-я]+",
            r"ICPC",
            r"олимпиадное программирование",
            r"спортивное программирование",
            r"ACM",
            r"IOI",
            r"ВСОШ.*информатик",
        ],
        "продуктовое программирование": [
            r"продуктов[а-я]+\s+программирован[а-я]+",
            r"хакатон",
            r"разработка продукт[а-я]+",
            r"создани[а-я]+\s+продукт[а-я]+",
            r"хакатон.*продукт",
            r"продукт.*хакатон",
        ],
        "программирование систем информационной безопасности": [
            r"информационн[а-я]+\s+безопасност[а-я]+",
            r"кибербезопасност[а-я]+",
            r"CTF",
            r"безопасност[а-я]+\s+систем",
        ],
        "программирование робототехники": [
            r"робототехник[а-я]+",
            r"программирован[а-я]+\s+робот[а-я]+",
            r"робот.*программирован",
        ],
        "программирование беспилотных авиационных систем": [
            r"беспилотн[а-я]+\s+(?:авиационн[а-я]+\s+)?систем[а-я]+",
            r"БПЛА",
            r"дрон[а-я]+",
            r"беспилотн[а-я]+.*аппарат",
        ],
    }

    # Check for discipline mentions using patterns
    for discipline, patterns in discipline_patterns.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                disciplines.append(discipline)
                break

    # Special cases based on context
    if "хакатон" in text_lower and not disciplines:
        # If it's a hackathon and no discipline is detected, assume it's product programming
        disciplines.append("продуктовое программирование")
    elif "ICPC" in text or "ACM" in text:
        # If it's an ICPC/ACM event, it's definitely algorithmic programming
        if "алгоритмическое программирование" not in disciplines:
            disciplines.append("алгоритмическое программирование")

    # Use morphological analysis to find programming-related terms
    programming_indicators = {
        "программирование": set(["алгоритмическое программирование"]),
        "разработка": set(["продуктовое программирование"]),
        "кодинг": set(["продуктовое программирование"]),
        "хакатон": set(["продуктовое программирование"]),
        "алгоритм": set(["алгоритмическое программирование"]),
        "олимпиада": set(["алгоритмическое программирование"]),
        "контест": set(["алгоритмическое программирование"]),
    }

    for token in doc.tokens:
        if token.lemma in programming_indicators:
            disciplines.extend(programming_indicators[token.lemma])

    return list(set(disciplines))


def extract_participant_count(text: str) -> Optional[int]:
    """Extract participant count using Natasha NLP."""
    doc = Doc(text)
    doc.segment(segmenter)
    doc.tag_morph(morph_tagger)

    text_lower = text.lower()

    # First check for team size patterns
    team_patterns = [
        r"команд[а-я]*\s+(?:по|из|численностью)\s+(\d+)(?:\s*-\s*(\d+))?\s+человек",
        r"состав[а-я]*\s+команд[а-я]*\s*[:]\s*(\d+)(?:\s*-\s*(\d+))?\s+человек",
        r"команд[а-я]*\s+(?:по|из|численностью)\s+(\d+)(?:\s*-\s*(\d+))?\s+участник",
        r"состав[а-я]*\s+команд[а-я]*\s*[:]\s*(\d+)(?:\s*-\s*(\d+))?\s+участник",
    ]

    for pattern in team_patterns:
        match = re.search(pattern, text_lower)
        if match:
            team_size = match.groups()
            if len(team_size) == 2 and team_size[1]:  # Range given
                avg_size = (int(team_size[0]) + int(team_size[1])) // 2
            else:
                avg_size = int(team_size[0])

            # Look for number of teams
            team_count_patterns = [
                r"(\d+)\s+команд",
                r"команд\s*[:]\s*(\d+)",
                r"заявилось\s+(\d+)\s+команд",
            ]

            for team_pattern in team_count_patterns:
                team_count_match = re.search(team_pattern, text_lower)
                if team_count_match:
                    return int(team_count_match.group(1)) * avg_size

    # Common patterns for participant counts
    count_patterns = [
        # Exact counts
        r"(\d+)\s+(?:участник(?:а|ов)?|человек(?:а)?|спортсмен(?:а|ов)?)",
        r"участников?\s*[:]\s*(\d+)",
        r"зарегистрировалось\s+(\d+)",
        r"(?:примут|приняли)\s+участие\s+(\d+)",
        r"(?:участвует|участвуют|участвовало)\s+(\d+)",
        r"(?:собрал(?:а|о|и)?|собрались)\s+(\d+)",
        # Registration counts
        r"зарегистрировано\s+(\d+)",
        r"регистраций\s*[:]\s*(\d+)",
        r"заявок\s*[:]\s*(\d+)",
        r"заявилось\s+(\d+)",
        # Range patterns (take the upper bound)
        r"от\s+\d+\s+до\s+(\d+)\s+(?:участник|человек|спортсмен)",
        r"(\d+)(?:\s*-\s*|\s+до\s+)(\d+)\s+(?:участник|человек|спортсмен)",
    ]

    # Try exact patterns first
    for pattern in count_patterns:
        match = re.search(pattern, text_lower)
        if match:
            groups = match.groups()
            if len(groups) == 2:  # Range pattern
                return max(int(groups[0]), int(groups[1]))
            count = int(groups[0])
            # Validate the count is reasonable
            if 1 <= count <= 10000:  # Reasonable limits for a programming event
                return count

    # Check for approximate counts
    approx_patterns = [
        (r"более\s+(\d+)\s+(?:участник|человек|спортсмен)", 1.0),  # exact number
        (r"свыше\s+(\d+)\s+(?:участник|человек|спортсмен)", 1.0),  # exact number
        (r"около\s+(\d+)\s+(?:участник|человек|спортсмен)", 1.0),  # exact number
        (r"порядка\s+(\d+)\s+(?:участник|человек|спортсмен)", 1.0),  # exact number
        (r"почти\s+(\d+)\s+(?:участник|человек|спортсмен)", 0.95),  # slightly less
        (r"примерно\s+(\d+)\s+(?:участник|человек|спортсмен)", 1.0),  # exact number
        (r"более\s+(\d+)", 1.0),  # exact number
        (r"свыше\s+(\d+)", 1.0),  # exact number
        (r"около\s+(\d+)", 1.0),  # exact number
        (r"поряд��а\s+(\d+)", 1.0),  # exact number
    ]

    for pattern, multiplier in approx_patterns:
        match = re.search(pattern, text_lower)
        if match:
            count = int(match.group(1))
            # Validate the count is reasonable
            if 1 <= count <= 10000:  # Reasonable limits for a programming event
                return int(count * multiplier)

    # Look for numbers near participant-related words
    participant_words = {
        "участник",
        "спортсмен",
        "человек",
        "команда",
        "регистрация",
        "зарегистрировались",
        "атлет",
        "программист",
        "разработчик",
        "специалист",
    }

    # Create a list of tokens with their positions
    for token in doc.tokens:
        if token.lemma in participant_words:
            # Look for numbers in nearby context (within 5 tokens)
            context_start = max(0, token.start - 50)
            context_end = min(len(text_lower), token.stop + 50)
            context = text_lower[context_start:context_end]

            # Try to find numbers in the context
            numbers = re.findall(r"(\d+)", context)
            if numbers:
                # Convert all numbers to integers and take the largest one
                # that's reasonable (less than 10000)
                valid_numbers = [int(n) for n in numbers if 1 <= int(n) <= 10000]
                if valid_numbers:
                    return max(valid_numbers)

    return None


def process_message(message: dict) -> Optional[Event]:
    """Process a single message and extract event information if present."""
    # Skip service messages and messages without text
    if message.get("type") == "service" or "text" not in message:
        return None

    # Get the text content
    text = ""
    if isinstance(message["text"], str):
        text = message["text"]
    elif isinstance(message["text"], list):
        for item in message["text"]:
            if isinstance(item, str):
                text += item
            elif isinstance(item, dict) and "text" in item:
                text += item["text"]

    text_lower = text.lower()

    # Keywords that indicate an event announcement (future events)
    announcement_keywords = [
        "регистрация открыта",
        "приглашаем",
        "состоится",
        "пройдет",
        "проводит",
        "объявляет",
        "начало регистрации",
        "регистрация доступна",
        "приглашаются",
        "открыт набор",
        "проведет",
        "стартует",
        "открывается",
        "начнется",
        "приглашаются",
        "ждем вас",
        "успейте зарегистрироваться",
        "спешите участвовать",
        "не пропустите",
    ]

    # Keywords that indicate past events or news
    past_event_keywords = [
        "прошел",
        "прошла",
        "прошло",
        "прошли",
        "состоялся",
        "состоялась",
        "состоял��сь",
        "состоялись",
        "завершился",
        "завершилась",
        "завершилось",
        "завершились",
        "подведены итоги",
        "результаты",
        "победители",
        "призеры",
        "стали",
        "выиграли",
        "заняли",
        "получили",
        "поздравляем",
    ]

    event_keywords = [
        "соревнование",
        "турнир",
        "чемпионат",
        "олимпиада",
        "контест",
        "конкурс",
        "хакатон",
        "мероприятие",
        "первенство",
    ]

    # Check if this message is about a past event
    is_past_event = any(keyword in text_lower for keyword in past_event_keywords)
    if is_past_event:
        return None

    # Check if this message is an event announcement
    is_announcement = any(keyword in text_lower for keyword in announcement_keywords)
    has_event = any(keyword in text_lower for keyword in event_keywords)

    # Skip if not an event announcement
    if not (is_announcement and has_event):
        return None

    event = Event()

    # Extract title (first line or sentence that contains event keywords)
    sentences = text.split("\n")
    for sentence in sentences:
        sentence_lower = sentence.lower()
        if any(keyword in sentence_lower for keyword in event_keywords):
            # Clean up the title
            title = sentence.strip()
            # Remove common prefixes that might appear in announcements
            prefixes_to_remove = [
                "🎉",
                "📢",
                "❗️",
                "❗",
                "‼️",
                "⚡️",
                "🔥",
                "📣",
                "💥",
                "Внимание!",
                "Анонс:",
                "Объявление:",
                "🏆",
                "🔷",
                "🎊",
            ]
            for prefix in prefixes_to_remove:
                if title.startswith(prefix):
                    title = title[len(prefix) :].strip()
            event.title = title
            break

    # Extract description (rest of the text after title)
    if event.title and event.title in text:
        description_text = text[text.index(event.title) + len(event.title) :].strip()
        if description_text:
            event.description = description_text

    # Create Natasha Doc for text analysis
    doc = Doc(text)
    doc.segment(segmenter)
    doc.tag_morph(morph_tagger)

    # Extract disciplines first as they might help with age inference
    event.discipline = extract_disciplines(text)

    # Extract age range with context from disciplines
    age_min, age_max = extract_age_range(text)

    # If no explicit age range found, try to infer from context and discipline
    if age_min is None or age_max is None:
        # Check for specific age-related words
        if "молодеж" in text_lower:
            age_min = age_min or 14
            age_max = age_max or 35
        elif "школьник" in text_lower:
            age_min = age_min or 14
            age_max = age_max or 18
        elif "студент" in text_lower:
            age_min = age_min or 17
            age_max = age_max or 25

        # Check for discipline-specific defaults
        if (
            "хакатон" in text_lower
            or "продуктовое программирование" in event.discipline
        ):
            if "талантлив" in text_lower and "спортсмен" in text_lower:
                age_min = age_min or 14
                age_max = age_max or None
            else:
                age_min = age_min or 16
                age_max = age_max or None
        elif "алгоритмическое программирование" in event.discipline:
            if "достигших" in text_lower:
                match = re.search(r"достигших\s+(\d+)", text_lower)
                if match:
                    age_min = int(match.group(1))
            else:
                age_min = age_min or 14
                age_max = age_max or 25

        # Check for participant type hints
        if "ребят" in text_lower:
            age_min = age_min or 14
            age_max = age_max or 25

    # Validate and normalize age range
    if age_min is not None and age_max is not None:
        if age_min > age_max:
            age_min, age_max = age_max, age_min

    # Special case for hackathons with prize money
    if "хакатон" in text_lower and re.search(
        r"\d+\s*(?:000|млн|тыс[а-я]*)\s*руб", text_lower
    ):
        age_min = 16  # Most hackathons with prize money require participants to be at least 16
        age_max = None

    event.age_min = age_min
    event.age_max = age_max

    # Extract dates
    event.start_date = extract_date(text)
    event.end_date = extract_date(text)

    # Extract location
    event.location = extract_location(text)

    # Extract participant count
    event.participant_count = extract_participant_count(text)

    # Only return events that have at least a title and either a start date or location
    if event.title and (event.start_date or event.location):
        return event
    return None


def process_chat_history(file_path: str) -> List[Dict]:
    """Process a Telegram chat history file and extract events."""
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    events = []
    for message in data.get("messages", []):
        event = process_message(message)
        if event and event.title:  # Only include events with at least a title
            events.append(event.to_dict())

    return events


def main():
    # Process both chat histories
    parser = argparse.ArgumentParser(
        description="Extract events from Telegram chat history."
    )
    parser.add_argument("path", type=str, help="Path to the JSON chat history file")
    args = parser.parse_args()
    path_to_json = args.path

    # Process Kaliningrad events
    all_events = process_chat_history(path_to_json)
    print(f"\nTotal events detected: {len(all_events)}")

    # Write all events to a single file
    with open("extracted_events.json", "w", encoding="utf-8") as f:
        json.dump(
            {"events": all_events},
            f,
            ensure_ascii=False,
            indent=2,
            default=lambda x: x.__dict__,
        )


if __name__ == "__main__":
    main()
