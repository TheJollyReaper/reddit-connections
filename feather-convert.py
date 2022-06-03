import pyarrow.feather as feather
import pyarrow as pyarrow
import json

data = feather.read_table('./datasets/term_tsne_10000.feather')
# print(data[2][5])

dictionary = {}

for index, subreddit in enumerate(data[2], start=0):
    # print(subreddit)
    # print(index)
    # print[data]
    dictionary[subreddit.as_py()] = {'x':data[0][index].as_py(), 'y':data[1][index].as_py(), 'index': index, 'name': subreddit.as_py()}

# print(dictionary['battlefield'])

print(json.dumps(dictionary, indent = 4) )

with open ('./src/data/tsne_10000.json', 'w') as f:
    f.write(json.dumps(dictionary, indent = 4))