import csv
import json

data = {}

with open('./datasets/NEW_subreddit_attributes_scaled.csv', encoding='utf-8') as csvf:
    csvReader = csv.DictReader(csvf)
         
    for rows in csvReader:
            
        key = rows['subreddit']
        data[key] = rows

with open('./src/data/NEW_subreddit_attributes_scaled.json', 'w', encoding='utf-8') as jsonf:
        jsonf.write(json.dumps(data, indent=4))
         