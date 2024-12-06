import requests
import os
import json
from fake_headers import Headers
from bs4 import BeautifulSoup


def load_existing_data(file_path):
    if os.path.exists(file_path):
        with open(file_path, "r") as fin:
            return json.load(fin)
    return []


if __name__ == "__main__":
    result: list[dict] = load_existing_data("backend/parser/regions.json")
    url = "https://fsp-russia.com"
    print("Parsing started")
    while True:
        try:
            headers = Headers(headers=True).generate()
            response = requests.get(url + "/region/regions/", headers=headers)
            if response.status_code == 200:
                html_content = response.content
                soup = BeautifulSoup(html_content, "html.parser")
                if len(result) == 0:
                    main_region = soup.find("div", {"class": "contacts_info"})
                    sub = main_region.find("div", {"class": "cont sub"})
                    sub_resp = requests.get(
                        url + sub.find("a")["href"], headers=headers
                    )
                    logo: str
                    if sub_resp.status_code == 200:
                        logo = (
                            url
                            + BeautifulSoup(sub_resp.content, "html.parser")
                            .find("div", {"class": "detail"})
                            .find("img")["src"]
                        )
                    else:
                        raise Exception(
                            f"ошибка получения ссылки {sub_resp.status_code}"
                        )
                    ruk = (
                        main_region.find("div", {"class": "cont ruk"})
                        .find("p", {"class": "white_region"})
                        .text
                    )
                    contact = (
                        main_region.find("div", {"class": "cont con"})
                        .find("p", {"class": "white_region"})
                        .text
                    )
                    result.append(
                        {
                            "region": main_region.find(
                                "p", {"class": "white_region"}
                            ).text.strip(),
                            "district": None,
                            "head": ruk.strip() if ruk != "" else None,
                            "email": contact.strip() if contact != "" else None,
                            "logo": logo.strip(),
                        }
                    )
                regions = list(soup.find_all("div", {"class": "accordion-item"}))
                # Check if we need to resume from a specific position
                processed = set()
                if result:
                    processed = {
                        (item.get("region"), item.get("district")) for item in result
                    }
                for region in regions:
                    districts = list(region.find_all("div", {"class": "contact_td"}))
                    for district in districts:
                        sub = district.find("div", {"class": "cont sub"})
                        if (
                            region.find(
                                "div", {"class": "accordion-header"}
                            ).text.strip(),
                            sub.find("p", {"class": "white_region"}).text,
                        ) in processed:
                            continue
                        sub_resp = requests.get(
                            url + sub.find("a")["href"], headers=headers
                        )
                        logo: str
                        if sub_resp.status_code == 200:
                            logo = (
                                url
                                + BeautifulSoup(sub_resp.content, "html.parser")
                                .find("div", {"class": "detail"})
                                .find("img")["src"]
                            )
                        else:
                            raise Exception(
                                f"ошибка получения ссылки {sub_resp.status_code}"
                            )
                        ruk = (
                            district.find("div", {"class": "cont ruk"})
                            .find("p", {"class": "white_region"})
                            .text
                        )
                        contact = (
                            district.find("div", {"class": "cont con"})
                            .find("p", {"class": "white_region"})
                            .text
                        )
                        result.append(
                            {
                                "region": region.find(
                                    "div", {"class": "accordion-header"}
                                ).text.strip(),
                                "district": sub.find(
                                    "p", {"class": "white_region"}
                                ).text
                                if sub.text != ""
                                else None,
                                "head": ruk if ruk != "" else None,
                                "email": contact if contact != "" else None,
                                "logo": logo,
                            }
                        )
                with open("backend/parser/regions.json", "w") as fout:
                    json.dump(result, fout, ensure_ascii=False, indent=4)
                break
            else:
                print(f"Ошибка: {response.status_code}")

        except Exception as e:
            with open("backend/parser/regions.json", "w") as fout:
                json.dump(result, fout, ensure_ascii=False, indent=4)
            print(f"Произошла ошибка: {e}")

        print("Changing user agent...")

    print("PARSING FINISHED!")
