import pandas as pd
import numpy as np
import csv 



pairwise = pd.read_csv("datasets/pairwise_variables.csv")
small_pairwise = pd.read_csv("datasets/small_pairwise.csv")
attributes = pd.read_csv("datasets/subreddit_attributes.csv")


# below, filters out pairs that have a weaker mutualism and competition
ESTIMATE_THRESHOLD = 0.127

# below, filters out pairs that have a lower number of cross-posts
CROSS_POSTING_THRESHOLD = 20

# below, filters out pairs that have a lower author similarity
AUTHOR_SIMILARITY_THRESHOLD = 0.98

# below, filters out pairs that have a lower term similarity
TERM_SIMILARITY_THRESHOLD = 0.99



## ESTIMATE
# This code creates two csv files in the datasets folder
# 1. "estimates_full.csv" has a column of the text of the hover tag in it for competition/mutualism
# 2. "estimates_lines.csv" is the same but only includes subreddits where the estimate
#     that is in the 5th highest and lowest percentiles. These are the only lines that are going to be
#     shown when the user clicks "competition/mutualism" for lines.


# remove estimates wih p-value over 0.05
# create column of standardized values
estimates_full = pairwise
estimates_full['new_estimate'] = estimates_full.loc[estimates_full['Std. Error'] < 0.05, 'Estimate']
estimates_full = estimates_full.loc[estimates_full['new_estimate'].notnull()]
estimates_full['new_estimate'] = round(estimates_full['new_estimate'], 4)

quants = list(round(estimates_full['new_estimate'].quantile([0, 0.05, 0.25,0.45,0.75,0.95, 1.0]), 4))
zero = np.quantile(estimates_full['new_estimate'], .45)

conditions = [
    (estimates_full['new_estimate'] <= quants[6]) & (estimates_full['new_estimate'] > quants[5]),
    (estimates_full['new_estimate'] <= quants[5]) & (estimates_full['new_estimate'] > quants[4]),
    (estimates_full['new_estimate'] <= quants[4]) & (estimates_full['new_estimate'] > quants[3]),
    (estimates_full['new_estimate'] <= quants[3]) & (estimates_full['new_estimate'] > quants[2]),
    (estimates_full['new_estimate'] <= quants[2]) & (estimates_full['new_estimate'] > quants[1]),
    (estimates_full['new_estimate'] <= quants[1]) & (estimates_full['new_estimate'] >= quants[0]),
]


choices = [
    'very mutualistic',
    'somewhat mutualistic',
    'a little mutualistic',
    'a little competitive',
    'somewhat competitive',
    'very competitive',
    ]

estimates_full['hover_tag'] = np.select(conditions, choices)
estimates_full = estimates_full[['Subreddit.j', 'Subreddit.i', 'new_estimate', 'hover_tag' ]]


# Create a dataframe only of the most competitive and mutualistic rows
estimate_lines = estimates_full[np.abs(estimates_full['new_estimate']) > ESTIMATE_THRESHOLD]


# export dataframes to csv
estimates_full.to_csv("datasets/estimates_full.csv")
estimate_lines.to_csv("datasets/estimates_lines.csv")


# CROSS POSTING
# This code creates two csv files in the datasets folder
# 1. "cross_posting_full.csv" has a column of the number of cross posts
# 2. "cross_posting_full_lines.csv" is the same but only includes subreddits where 
    # there are a LOT of cross_posts

cp = small_pairwise
cp = cp[['Subreddit.j', 'Subreddit.i', 'cross_posts']]
cp.to_csv("datasets/cross_posting.csv")
cp = cp[cp['cross_posts'] > CROSS_POSTING_THRESHOLD]
cp.to_csv("datasets/cross_posting_lines.csv")



# AUTHOR SIMILARITY

auth = small_pairwise

quants = list(round(auth['author_similarity'].quantile([0.25, 0.50, 0.75, 1.0]), 4))
auth['author_similarity'] = round(auth['author_similarity'], 4)

conditions = [
    (auth['author_similarity'] <= quants[3]) & (auth['author_similarity'] > quants[2]),
    (auth['author_similarity']<= quants[2]) & (auth['author_similarity'] > quants[1]),
    (auth['author_similarity']  <= quants[1]) & (auth['author_similarity'] > quants[0]),
    (auth['author_similarity'] <= quants[0]) & (auth['author_similarity'] > 0),
    (auth['author_similarity'] <= 0)
]

choices = [
    'very high author similarity',
    'high author similarity',
    'some author similarity',
    'a little author similarity',
    'no author similarity'
    ]

auth['hover_tag'] = np.select(conditions, choices)
auth = auth[['Subreddit.j', 'Subreddit.i', 'author_similarity', 'hover_tag' ]]

# Create a dataframe only of the most competitive and mutualistic rows
author_lines = auth[np.abs(auth['author_similarity']) > AUTHOR_SIMILARITY_THRESHOLD]

# export dataframes to csv
auth.to_csv("datasets/author_similarity.csv")
author_lines.to_csv("datasets/author_lines.csv")


# TERM SIMILARITY
term = small_pairwise

quants = list(round(term['term_similarity'].quantile([0.25, 0.50, 0.75, 1.0]), 4))
term['term_similarity'] = round(term['term_similarity'], 4)

conditions = [
    (term['term_similarity'] <= quants[3]) & (term['term_similarity'] > quants[2]),
    (term['term_similarity']<= quants[2]) & (term['term_similarity'] > quants[1]),
    (term['term_similarity']  <= quants[1]) & (term['term_similarity'] > quants[0]),
    (term['term_similarity'] <= quants[0]) & (term['term_similarity'] > 0),
    (term['term_similarity'] <= 0)
]


choices = [
    'very high term similarity',
    'high term similarity',
    'some term similarity',
    'a little term similarity',
    'no term similarity'
    ]

term['hover_tag'] = np.select(conditions, choices)
term = term[['Subreddit.j', 'Subreddit.i', 'term_similarity', 'hover_tag']]


# export dataframes to csv
term.to_csv("datasets/term_similarity.csv")

term_lines = term[term['term_similarity'] > TERM_SIMILARITY_THRESHOLD]
term_lines.to_csv("datasets/term_similarity_lines.csv")


# CREATE SMALL PAIRWISE DATASET
pairs = {} # keep track of pairs of subreddits, key is a sub, value is list of unique subs it is paired with
count = 0 # number of unique pairs of subreddits
rows_list = [] # list of lists that include row information for each row

# opening the CSV file 
with open('datasets/pairwise_variables.csv', mode ='r') as file: 
      
  # reading the CSV file 
  csv_reader = csv.reader(file) 
  cols = [6,7,8,15,16]

# for each line
  for line in csv_reader: 
      line = [line[i] for i in cols]
    # get subreddits
      sub_j = line[0]
      sub_i = line[1]
      # if the pair is not already in the dictionary
      if sub_i in pairs.keys():
          if sub_j not in pairs[sub_i]:
            pairs[sub_j].append(sub_i)
            rows_list.append(line)
            count += 1      
      else:
            pairs[sub_j] = []
            pairs[sub_j].append(sub_i)
            rows_list.append(line)
            count += 1
with open('datasets/small_pairwise.csv', 'w') as csvfile:
    writer = csv.writer(csvfile,  lineterminator = '\n')
    for i in range(count):
        writer.writerow(rows_list[i])