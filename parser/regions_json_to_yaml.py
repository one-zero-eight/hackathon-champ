import json
import yaml

with open("regions.json") as f:
    data = json.load(f)

with open("regions.yaml", "w") as f:
    yaml.dump(data, f, allow_unicode=True, sort_keys=False)
