import requests
import os
import json
import time 
import re
import locale
from datetime import datetime
from fake_headers import Headers
from bs4 import BeautifulSoup

def parse_age_range(participants):
    if participants == "":
        return None, None
    
    # Регулярное выражение для поиска возрастных диапазонов
    age_range_pattern = re.compile(r'(\d+)\s*-\s*(\d+)|от\s*(\d+)|(\d+)\s*лет')
    match = age_range_pattern.search(participants)
    
    if match:
        start_age = match.group(1) or match.group(3) or match.group(4)
        end_age = match.group(2)
        
        if start_age:
            start_age = int(start_age)
        if end_age:
            end_age = int(end_age)
        
        return start_age, end_age
    
    # Обработка категорий "Мужчины" и "Все"
    if participants == "Мужчины" or participants == "Студенты":
        return 18, None  # Или можно вернуть фиксированные значения, если нужно
    elif participants == "Все":
        return None, None  # Или можно вернуть фиксированные значения, если нужно

if __name__ == "__main__":
    locale.setlocale(locale.LC_TIME, 'ru_RU.UTF-8')
    result: list[dict] = []
    url = 'https://fsp-russia.com'
    print("Parsing started")
    try:
        headers = Headers(headers=True).generate()
        response = requests.get(url + '/calendar/archive/', headers=headers)
        if response.status_code == 200:
            html_content = response.content
            soup = BeautifulSoup(html_content, "html.parser")
            events = list(soup.find_all('div', {'class': 'archive_item'}))
            for event in events:
                event_name = event.find('div', {'class': 'title'}).find('p').text.strip()
                date = event.find('div', {'class': 'date_min'}).find('p').text.strip().split('-')
                date_min = datetime.strptime(date[0] + " ".join(date[1].strip().split(' ')[1:]), "%d %B %Y г.")
                date_max= datetime.strptime(date[1].strip(), "%d %B %Y г.")
                if date_min.day > date_max.day:
                    date_max = date_max.replace(month=date_max.month % 12 + 1)
                location = event.find('div', {'class': 'city'}).find('p')
                if location:
                   location = location.text.strip()
                location = location if location != "" else None
                disciplines = [discipline.find('p').text.strip() for discipline in event.find_all('div', {'class': 'discipline'}) if discipline.find('p').text.strip() != ""]
                if not disciplines:
                    disciplines = None 
                participants = event.find('div', {'class': 'mens'}).find('p').text.strip()
                start_age, end_age = parse_age_range(participants)
                result.append(
                    {
                        "title": event_name,
                        "start_date": date_min.isoformat(),
                        "end_date": date_max.isoformat(),
                        "location": location,
                        "disciplines": disciplines,
                        "start_age": start_age,
                        "end_age": end_age,
                    }
                )
            with open('parser/events_archive.json', 'w') as fout:
                json.dump(result , fout, ensure_ascii=False, indent=4)
        else:
            raise Exception(f"Ошибка: {response.status_code}")
        print("PARSING FINISHED!")

    except Exception as e:
        print(f"Произошла ошибка: {e}")