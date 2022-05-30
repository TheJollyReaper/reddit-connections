from csv import reader
import json

cross_posting = {}
current_index = 0

with open('./datasets/term_similarity.csv') as read_obj:
    csv_reader = reader(read_obj)
    headers = next(csv_reader)
    for row in csv_reader:
        # print(row)
        cross_posting[str(row[1]+row[2])] = {headers[0]:row[0], headers[1]:row[1], headers[2]:row[2], headers[3]:row[3], headers[4]:row[4]}
        # for idx, x in enumerate(headers):
            # if idx in cross_posting:
                # cross_posting[current_index] = {headers[idx]:row[idx]}
            # cross_posting[str(current_index)][headers[5]] = row[idx]
        current_index += 1
        # print(row['subreddit.j'])
        # print(row[16])
        # cross_posting[current_index]


with open('./src/data/term_similarity.json', 'w') as json_file:
  json.dump(cross_posting, json_file, indent=4, sort_keys=True)
  