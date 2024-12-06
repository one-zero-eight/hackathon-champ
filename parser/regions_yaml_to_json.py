import json
import yaml

with open("regions.yaml", "r") as f:
    data = yaml.safe_load(f)

with open("regions.json", "w") as f:
    json.dump(data, f, indent=4, ensure_ascii=False, sort_keys=False)
