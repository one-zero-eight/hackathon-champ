import requests
import os
import json
from fake_headers import Headers
from bs4 import BeautifulSoup


import os
import requests
from PIL import Image
import io

def download_image(url):
    """Download an image from a URL."""
    response = requests.get(url)
    if response.status_code == 200:
        return Image.open(io.BytesIO(response.content))
    else:
        raise Exception(f"Failed to download image from {url}")

def get_background_color(image):
    """Get the RGBA value of the pixel at (0, 0)."""
    if image.mode != "RGBA":
        image = image.convert("RGBA")
    return image.getpixel((0, 0))

def make_background_transparent(image, background_color):
    """Make the background transparent based on the given color."""
    if image.mode != "RGBA":
        image = image.convert("RGBA")

    # Create a mask for the background
    data = image.getdata()
    new_data = []
    for item in data:
        # Replace pixels matching the background color with transparent
        if item[:3] == background_color[:3]:  # Compare RGB values
            new_data.append((0, 0, 0, 0))  # Make it fully transparent
        else:
            new_data.append(item)

    # Update the image data
    image.putdata(new_data)

    return image

def save_as_webp(image, output_path):
    """Save the image as WebP."""
    image.save(output_path, "WEBP")

def resize_image(image, size=(256, 256)):
    """Resize the image to the specified size."""
    return image.resize(size, Image.Resampling.LANCZOS)

def process_logo(logo_url, output_folder):
    """Download the logo, remove its background, and save it as WebP."""
    try:
        # Download the logo
        logo = download_image(logo_url)

        # Get the background color from the pixel at (0, 0)
        background_color = get_background_color(logo)
        print(f"Background color at (0, 0): {background_color}")

        # Remove the background and make it white
        processed_logo = make_background_transparent(logo, background_color)

        resized_logo = resize_image(processed_logo, size=(256, 256))

        # Save the processed logo as WebP
        save_as_webp(resized_logo, output_folder)
        print(f"Processed logo saved successfully at: {output_folder}")
    except Exception as e:
        print(f"Error processing logo: {e}")

def load_existing_data(file_path):
    if os.path.exists(file_path):
        with open(file_path, "r") as fin:
            return json.load(fin)
    return []


if __name__ == "__main__":
    result: list[dict] = load_existing_data("parser/regions.json")
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
                        process_logo(logo, f"backend/static/{logo.split('/')[-1].split('.')[0]}.webp")
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
                            process_logo(logo, f"backend/static/{logo.split('/')[-1].split('.')[0]}.webp")
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
                with open("parser/regions.json", "w") as fout:
                    json.dump(result, fout, ensure_ascii=False, indent=4)
                break
            else:
                print(f"Ошибка: {response.status_code}")

        except Exception as e:
            with open("parser/regions.json", "w") as fout:
                json.dump(result, fout, ensure_ascii=False, indent=4)
            print(f"Произошла ошибка: {e}")

        print("Changing user agent...")

    print("PARSING FINISHED!")