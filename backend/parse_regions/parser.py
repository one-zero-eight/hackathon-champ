import requests
import os
import json
from bs4 import BeautifulSoup

def load_existing_data(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r') as fin:
            return json.load(fin)
    return []

if __name__ == "__main__":
    result: list[dict] = load_existing_data("regions.json")
    url = 'https://fsp-russia.com'
    try:
        response = requests.get(url + '/region/regions/')
        if response.status_code == 200:
            html_content = response.content
            soup = BeautifulSoup(html_content, 'html.parser')
            main_region = soup.find('div', {'class': 'contacts_info'})
            sub = main_region.find('div', {'class': 'cont sub'})
            sub_resp = requests.get(url + sub.find('a')['href'])
            logo: str 
            if sub_resp.status_code == 200:
                logo = url + BeautifulSoup(sub_resp.content, 'html.parser').find('div', {'class': 'detail'}).find('img')['src']
            else:
                raise Exception(f"ошибка получения ссылки {sub_resp.status_code}")
            ruk = main_region.find('div', {'class': 'cont ruk'}).find('p', {'class': 'white_region'}).text
            contact = main_region.find('div', {'class': 'cont con'}).find('p', {'class': 'white_region'}).text
            result.append(
                {
                    'region': main_region.find('p', {'class': 'white_region'}).text.strip(),
                    'district': None,
                    'head': ruk.strip() if ruk != "" else None,
                    'email': contact.strip() if contact != "" else None,
                    'logo': logo.strip(),
                }
            )
            regions = list(soup.find_all('div', {'class':'accordion-item'}))
            # Check if we need to resume from a specific position
            last_processed_region = None
            last_processed_district = None
            if result:
                last_entry = result[-1]
                last_processed_region = last_entry.get('region')
                last_processed_district = last_entry.get('district')
            for region in regions:
                districts = list(region.find_all('div', {'class': 'contact_td'}))
                for district in districts:
                    if last_processed_region == region.find('div', {'class': 'accordion-header'}).text.strip() and sub.find('p', {'class': 'white_region'}).text == last_processed_region:
                        continue 
                    sub = district.find('div', {'class': 'cont sub'})
                    sub_resp = requests.get(url + sub.find('a')['href'])
                    logo: str 
                    if sub_resp.status_code == 200:
                        logo = url + BeautifulSoup(sub_resp.content, 'html.parser').find('div', {'class': 'detail'}).find('img')['src']
                    else:
                        raise Exception(f"ошибка получения ссылки {sub_resp.status_code}")
                    ruk = district.find('div', {'class': 'cont ruk'}).find('p', {'class': 'white_region'}).text
                    contact = district.find('div', {'class': 'cont con'}).find('p', {'class': 'white_region'}).text
                    result.append(
                        {
                            'region': region.find('div', {'class': 'accordion-header'}).text.strip(),
                            'district': sub.find('p', {'class': 'white_region'}).text if sub.text != "" else None,
                            'head': ruk if ruk != "" else None,
                            'email': contact if contact != "" else None,
                            'logo': logo,
                        }
                    )
            with open('regions.json', 'a+') as fout:
                json.dump(result , fout)
        else:
            print(f"Ошибка: {response.status_code}")
       
    except Exception as e:
        with open('regions.json', 'a+') as fout:
            json.dump(result , fout)
        print(f"Произошла ошибка: {e}")