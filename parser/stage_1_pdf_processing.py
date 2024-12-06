import argparse
from collections import defaultdict
from itertools import pairwise
from pathlib import Path

import pandas as pd
import pdfplumber
from pdfplumber.table import TableSettings
from pdfplumber.page import Page
from pypdf import PdfReader, PdfWriter, annotations
from tqdm import tqdm

pd.set_option("display.max_rows", None)
pd.set_option("display.max_columns", None)
pd.set_option("display.expand_frame_repr", False)

PAGE_NUMBERING_BBOX = (385, 555, 460, 570)
DEBUG = True

debug_tables = defaultdict(list)


def anchoring(pdf):
    label_locations = []

    for page_number, page in tqdm(
        enumerate(pdf.pages), total=len(pdf.pages), desc="Anchoring", unit="page"
    ):
        # Crop the page as before
        page_crop = page.outside_bbox(PAGE_NUMBERING_BBOX)

        # Extract words from the cropped page
        text_lines = page_crop.extract_text_lines(return_chars=False)
        # sort by y0
        text_lines = sorted(text_lines, key=lambda x: x["top"])

        for i, text_line in enumerate(text_lines):
            # Check if the text line is above the bounding box
            if text_line["text"] == "Основной состав":
                # Get first above text line
                if i > 0:
                    above_text_line_page = page_number
                    above_text_line = text_lines[i - 1]
                else:  # from previous page
                    prev_page: Page = pdf.pages[page_number - 1]
                    above_text_line_page = page_number - 1
                    prev_page = prev_page.outside_bbox(PAGE_NUMBERING_BBOX)
                    prev_text_lines = prev_page.extract_text_lines(return_chars=False)
                    # sort by y0
                    prev_text_lines = sorted(
                        prev_text_lines, key=lambda x: x["top"], reverse=True
                    )
                    above_text_line = prev_text_lines[0]
                label_locations.append(
                    {
                        "page": above_text_line_page,
                        "x0": above_text_line["x0"],
                        "y0": above_text_line["top"],
                        "x1": above_text_line["x1"],
                        "y1": above_text_line["bottom"],
                        "label": "Наименование",
                        "text": above_text_line["text"],
                    }
                )
                label_locations.append(
                    {
                        "page": page_number,
                        "x0": text_line["x0"],
                        "y0": text_line["top"],
                        "x1": text_line["x1"],
                        "y1": text_line["bottom"],
                        "label": "Основной состав",
                        "text": None,
                    }
                )

            elif text_line["text"] == "Молодежный (резервный) состав":
                label_locations.append(
                    {
                        "page": page_number,
                        "x0": text_line["x0"],
                        "y0": text_line["top"],
                        "x1": text_line["x1"],
                        "y1": text_line["bottom"],
                        "label": "Молодежный (резервный) состав",
                        "text": None,
                    }
                )

    return label_locations


def postprocess(df):
    """
    ```
    0,51.02,231.52,212.44,243.52,Наименование,АВИАМОДЕЛЬНЫЙ СПОРТ
    0,22.68,251.76,102.87,260.76,Основной состав,
    11,22.68,178.68,181.70,187.68,Молодежный (резервный) состав,
    15,51.02,414.72,196.69,426.72,Наименование,АВИАЦИОННЫЕ ГОНКИ
    15,22.68,434.96,102.87,443.96,Основной состав,
    16,51.02,180.64,212.42,192.64,Наименование,АВТОМОБИЛЬНЫЙ СПОРТ
    16,22.68,200.88,102.87,209.88,Основной состав,
    40,22.68,339.24,181.70,348.24,Молодежный (резервный) состав,
    ```

    We need to get collapsed df: subsequent ('Наимнование', 'Основной состав', 'Молодежный (резервный) состав')
    rows should be merged into one row:

    name_page, name_bbox, name_text, main_page, main_bbox, youth_page, youth_bbox
    """

    prev_name_text = None
    prev_name_page = prev_main_page = prev_youth_page = None
    prev_name_bbox = prev_main_bbox = prev_youth_bbox = None
    data = []
    for i, row in df.iterrows():
        if row["label"] == "Наименование":
            # flush
            if prev_name_text:
                data.append(
                    {
                        "name_page": prev_name_page,
                        "name_bbox": prev_name_bbox,
                        "name_text": prev_name_text,
                        "main_page": prev_main_page,
                        "main_bbox": prev_main_bbox,
                        "youth_page": prev_youth_page,
                        "youth_bbox": prev_youth_bbox,
                    }
                )
                prev_name_text = prev_name_page = prev_main_page = prev_youth_page = (
                    None
                )
                prev_name_bbox = prev_main_bbox = prev_youth_bbox = None

            prev_name_text = row["text"]
            prev_name_page = row["page"]
            prev_name_bbox = (row["x0"], row["y0"], row["x1"], row["y1"])
        elif row["label"] == "Основной состав":
            prev_main_page = row["page"]
            prev_main_bbox = (row["x0"], row["y0"], row["x1"], row["y1"])
        elif row["label"] == "Молодежный (резервный) состав":
            prev_youth_page = row["page"]
            prev_youth_bbox = (row["x0"], row["y0"], row["x1"], row["y1"])
    # flush last one
    if prev_name_text:
        data.append(
            {
                "name_page": prev_name_page,
                "name_bbox": prev_name_bbox,
                "name_text": prev_name_text,
                "main_page": prev_main_page,
                "main_bbox": prev_main_bbox,
                "youth_page": prev_youth_page,
                "youth_bbox": prev_youth_bbox,
            }
        )

    new_df = pd.DataFrame(
        data,
        columns=[
            "name_page",
            "name_text",
            "main_page",
            "youth_page",
            "name_bbox",
            "main_bbox",
            "youth_bbox",
        ],
    )
    # make page columns int
    new_df["name_page"] = new_df["name_page"].astype(int)
    new_df["main_page"] = new_df["main_page"].astype(int)
    # new_df["youth_page"] = new_df["youth_page"] # not possible
    return new_df


def extract_tables(pdf, df):
    """
    How to extract tables:

          Name 1
        Main
        +---------+
        |         |
        |         |
        |         |
        |         |
        +---------+
           Name 2
        Main
        +---------+
        |         |
        | Table   |
        |         |
        |         |
        +---------+
           Name 3
        Main
        +---------+
        | Table   |

         > line break

        | Same    |
        | Table   |
        |         |
        +---------+

    Will produce dict of three dataframes, for each item in input df
    """
    EXPLICIT_VERTICAL_LINES = [26, 109, 392, 476, 734, 816]

    remove_crops = defaultdict(list)  # page: [crop]

    for i, row in df.iterrows():
        remove_crops[row["name_page"]].append(row["name_bbox"])
        remove_crops[row["main_page"]].append(row["main_bbox"])
        if pd.notna(row["youth_page"]):
            remove_crops[row["youth_page"]].append(row["youth_bbox"])

    tables = defaultdict(list)  # df_index: [tables]

    # sort by "main_page"
    df = df.sort_values("main_page")
    rows = list(df.iterrows())
    rows.append(None)

    for (i, row), next_ in tqdm(
        pairwise(rows), total=len(rows), desc="Extracting tables", unit="sport"
    ):
        assert row["name_page"] <= row["main_page"]
        if pd.notna(row["youth_page"]):
            assert row["main_page"] <= int(row["youth_page"])

        if next_:
            assert row["main_page"] <= next_[1]["name_page"]

        first_page = row["main_page"]
        # name_page of next row
        last_page = next_[1]["name_page"] if next_ else len(pdf.pages) - 1

        for page_number in range(first_page, last_page + 1):
            page: Page = pdf.pages[page_number]
            page = page.outside_bbox(PAGE_NUMBERING_BBOX)
            for crop in remove_crops.get(page.page_number - 1, []):
                page = page.outside_bbox(crop)
            params = {
                "explicit_vertical_lines": EXPLICIT_VERTICAL_LINES,
                "explicit_horizontal_lines": [],
            }

            if page_number == first_page:
                # crop from bottom of main bbox until bottom of page
                page = page.crop((0, row["main_bbox"][3], page.width, page.height))
                params["explicit_horizontal_lines"].append(row["main_bbox"][3])
            else:
                params["explicit_horizontal_lines"].append(0)

            if next_:
                if page_number == next_[1]["name_page"]:
                    # crop from top of page until top of next name bbox
                    page = page.crop(
                        (0, 0, page.width, next_[1]["name_bbox"][1]), strict=False
                    )

            if page.height < 5:
                print(f"page crop {page_number} for {row['name_text']} is too small")
                continue

            table = page.find_table(table_settings=params)

            if table:
                tset = TableSettings.resolve(params)
                texts = table.extract(**(tset.text_settings or {}))
                tables[i].append((texts, page_number + 1))

                if DEBUG:
                    debug_tables[page.page_number].append({"table": table, "sport": i})

    # convert to dfs
    as_dfs = {}  # df_index: df
    for i, table_list in tables.items():
        _ = []
        for t, page in table_list:
            for r in t:
                _.append(r + [page])

        as_dfs[i] = pd.DataFrame(
            _,
            columns=[
                "№",
                "Наименование",
                "Сроки",
                "Место",
                "Количество участников",
                "Страница",
            ],
        )
        # set "№" as index
        as_dfs[i].set_index("№", inplace=True)

    return as_dfs


def debug_draw(pdf_path, df):
    """
    Draw rectangles on the pdf pages (name bbox, main bbox, youth bbox)
    """
    writer = PdfWriter()
    reader = PdfReader(pdf_path)
    heights = []
    for page in reader.pages:
        heights.append(page.mediabox[3])
        writer.add_page(page)
    assert len(set(heights)) == 1
    H = heights[0]

    colors = ["#FF0000", "#00FF00", "#0000FF"]

    for i, row in df.iterrows():
        name_bbox = row["name_bbox"]
        main_bbox = row["main_bbox"]
        youth_bbox = row["youth_bbox"]
        writer.add_annotation(
            page_number=row["name_page"],
            annotation=annotations.FreeText(
                text="",
                rect=(name_bbox[0], H - name_bbox[3], name_bbox[2], H - name_bbox[1]),
                border_color=colors[i % 3],
                background_color=None,
            ),
        )
        writer.add_annotation(
            page_number=row["main_page"],
            annotation=annotations.FreeText(
                text="",
                rect=(main_bbox[0], H - main_bbox[3], main_bbox[2], H - main_bbox[1]),
                border_color=colors[i % 3],
                background_color=None,
            ),  # x_min, y_min, x_max, y_max
        )
        if pd.notna(row["youth_page"]):
            writer.add_annotation(
                page_number=int(row["youth_page"]),
                annotation=annotations.FreeText(
                    text="",
                    rect=(
                        youth_bbox[0],
                        H - youth_bbox[3],
                        youth_bbox[2],
                        H - youth_bbox[1],
                    ),
                    border_color=colors[i % 3],
                    background_color=None,
                ),
            )

    for page_number, data in debug_tables.items():
        print(f"Drawing table on page {page_number}")
        for table_data in data:
            table = table_data["table"]
            # bbox = table.bbox
            # writer.add_annotation(
            #     page_number=page_number - 1,
            #     annotation=annotations.FreeText(
            #         text="",
            #         rect=(bbox[0], H - bbox[3], bbox[2], H - bbox[1]),
            #         border_color=colors[table_data["sport"] % 3],
            #         background_color=None,
            #     ),
            # )
            # Draw each cell in the table
            for cell in table.cells:
                writer.add_annotation(
                    page_number=page_number - 1,
                    annotation=annotations.FreeText(
                        text="",
                        rect=(
                            cell[0],
                            H - cell[3],
                            cell[2],
                            H - cell[1],
                        ),
                        border_color=colors[table_data["sport"] % len(colors)],
                        background_color=None,
                    ),
                )

    # Save the modified PDF
    with open("debugged_output.pdf", "wb") as f:
        writer.write(f)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process a PDF for table extraction.")
    parser.add_argument("pdf_path", type=str, help="Path to the PDF file.")
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debugging mode with annotated output.",
    )
    args = parser.parse_args()

    pdf_path = Path(args.pdf_path)
    DEBUG = args.debug

    pdf = pdfplumber.open(pdf_path)

    # results_df = pd.DataFrame(anchoring(pdf))
    # print(results_df.head())
    # results_df.to_csv("label_locations.csv", index=False, float_format="%.2f")
    results_df = pd.read_csv("label_locations.csv")
    postprocessed_df = postprocess(results_df)
    print(postprocessed_df.head())
    postprocessed_df.to_csv(
        "postprocessed_label_locations.csv", index=False, float_format="%.2f"
    )

    df_x_data = extract_tables(pdf, postprocessed_df)

    if DEBUG:
        debug_draw(pdf_path, postprocessed_df)

    for i, df in df_x_data.items():
        df["Спорт"] = postprocessed_df.iloc[i]["name_text"]
        print(df.head())
        print(
            f"Уникальные наименования `{postprocessed_df.iloc[i]["name_text"]}`:",
            df["Наименование"].nunique(),
        )

    # save to one csv
    pd.concat(df_x_data.values()).to_csv(
        "events.csv",
        index=True,
        columns=[
            "Спорт",
            "Наименование",
            "Сроки",
            "Место",
            "Количество участников",
            "Страница",
        ],
    )
