from csv import reader
import json

cross_posting = {}
current_index = 0

with open('./src/data/cross_posting_lines.csv') as read_obj:
    csv_reader = reader(read_obj)
    headers = next(csv_reader)
    for row in csv_reader:
        # print(row)
        cross_posting[current_index] = {headers[16]:row[16], headers[17]:row[17], headers[18]:row[18]}
        # for idx, x in enumerate(headers):
            # if idx in cross_posting:
                # cross_posting[current_index] = {headers[idx]:row[idx]}
            # cross_posting[str(current_index)][headers[5]] = row[idx]
        current_index += 1
        # print(row['subreddit.j'])
        # print(row[16])
        # cross_posting[current_index]


with open('cross_posting_lines.json', 'w') as json_file:
  json.dump(cross_posting, json_file, indent=4, sort_keys=True)
  