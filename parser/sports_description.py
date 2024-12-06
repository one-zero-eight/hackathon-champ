import pandas as pd

disciplines_df = pd.read_csv("disciplines.csv", header=None)

sports = disciplines_df[0].unique()

with open("sports_description.yaml") as f:
    import yaml

    sports_desc = yaml.safe_load(f)

print("Matching Sports:")
# check for matching sports
for sport in sports:
    if sport in sports_desc:
        print(f"{sport}:\n  {sports_desc[sport][:100]}...")
print("\n")

# check for extra sports
print("Extra sports:")
for sport in sports_desc:
    if sport not in sports:
        print(f"{sport}:\n  {sports_desc[sport]}")

print("\n")
print("Missing sports:")
# check for missing sports
for sport in sports:
    if sport not in sports_desc:
        print(f"{sport}:\n  _")

# save to json
with open("sports_description.json", "w") as f:
    import json

    json.dump(sports_desc, f, ensure_ascii=False, indent=2)

with open("sports.json") as f:
    sports = json.load(f)

# add description to sports.json
for sport_obj in sports:
    sport = sport_obj["sport"]
    if sport in sports_desc:
        sport_obj["description"] = sports_desc[sport]

with open("sports.json", "w") as f:
    json.dump(sports, f, ensure_ascii=False, indent=2)

with open("sports.json") as f:
    sports = json.load(f)

# add description to sports.json
for sport_obj in sports:
    sport = sport_obj["sport"]
    if sport in sports_desc:
        sport_obj["description"] = sports_desc[sport]

postprocessed_label_locations = pd.read_csv(
    "postprocessed_label_locations.csv", index_col=None
)
sport_x_page = {}
for _, row in postprocessed_label_locations.iterrows():
    sport_x_page[row["name_text"].upper()] = row["name_page"] + 1


# also add name_page to sports.json
for sport_obj in sports:
    sport = sport_obj["sport"]
    if sport.upper() in sport_x_page:
        sport_obj["page"] = sport_x_page[sport.upper()]
    else:
        print(f"Missing name_page for {sport}")

with open("sports.json", "w") as f:
    json.dump(sports, f, ensure_ascii=False, indent=2)
