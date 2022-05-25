import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from sympy import maximum

pairwise = pd.read_csv("datasets/pairwise_variables.csv")
attributes = pd.read_csv("datasets/subreddit_attributes.csv")

# below, filters out pairs that have a lower number of cross-posts
CROSS_POSTING_THRESHOLD = 20

# below, filters out pairs that have a lower author similarity
AUTHOR_SIMILARITY_THRESHOLD = 0.90

# below, filters out pairs that have a lower term similarity
TERM_SIMILARITY_THRESHOLD = 0.90



## ESTIMATE (HOVER TAGS AND LINES)
# This code creates two csv files in the datasets folder
# 1. "estimates_full.csv" has a column of the text of the hover tag in it for competition/mutualism
# 2. "estimates_lines.csv" is the same but only includes subreddits where the estimate
#     has a z-score above 2 or below -2. These are the only lines that are going to be
#     shown when the user clicks "competition/mutualism" for lines.


# remove estimates wih p-value over 0.05
# create column of standardized values
estimates_full = pairwise
estimates_full['new_estimate'] = estimates_full.loc[estimates_full['Std. Error'] < 0.05, 'Estimate']
estimates_full = estimates_full.loc[estimates_full['new_estimate'].notnull()]
estimates_full['new_estimate_scaled'] = (estimates_full['new_estimate'] - estimates_full['new_estimate'].mean()) / estimates_full['new_estimate'].std()  

# Define intervals based on z-score and label them in the column "hover tag"
conditions = [
    (estimates_full['new_estimate_scaled'] > 3),
    (estimates_full['new_estimate_scaled'] <= 3) & (estimates_full['new_estimate_scaled'] > 2),
    (estimates_full['new_estimate_scaled'] <= 2) & (estimates_full['new_estimate_scaled'] > 1),
    (estimates_full['new_estimate_scaled'] <= 1) & (estimates_full['new_estimate_scaled'] > 0),
    (estimates_full['new_estimate_scaled'] <= 0) & (estimates_full['new_estimate_scaled'] > -1),
    (estimates_full['new_estimate_scaled'] <= -1) & (estimates_full['new_estimate_scaled'] > -2),
    (estimates_full['new_estimate_scaled'] <= -2) & (estimates_full['new_estimate_scaled'] > -3),
    (estimates_full['new_estimate_scaled'] <= -3)
]

choices = [
    'most mutualistic',
    'very mutualistic',
    'somewhat mutualistic',
    'a little mutualistic',
    'a little competitive',
    'somewhat competitive',
    'very competitive',
    'most competitive']

estimates_full['hover_tag'] = np.select(conditions, choices)

# Create a dataframe only of the most competitive and mutualistic rows
estimates_lines = estimates_full[np.abs(estimates_full['new_estimate_scaled']) > 2]

# export dataframes to csv
estimates_full.to_csv("datasets/estimates_full.csv")
estimates_lines.to_csv("datasets/estimates_lines.csv")


# CROSS POSTING
# This code creates a csv file in the datasets folder to show which lines are shown whtn the variable is chosen for lines.
# This was tricky because the pandas grouby() was finicky but it works, only omits data poorly when more than 2 subreddits in the 
# same cluster share the same number of crossposts, but this is very seldom.
# 1. Rename the key column
# 2. Create a duplicate dataframe of the subreddits, key, and crossposts
# 3. Ensure the subreddits have over 50 crossposts
# 4. groupby() # of crossposts and the cluster id
# 5. merge the extra dataframe back in
# 6. rename the columns so subreddits j and i are named as they were at the beginning
# 7. Drop extra columns
# 8. standardize the cross-posting values and cap them at +3 and -3
# 8. Save as csv

key_fix = pairwise
key_fix['key'] = key_fix['Unnamed: 0']
cp_base = key_fix
cp_extra = key_fix[['key', 'Subreddit.i', 'Subreddit.j', 'cross_posts']]

cp_base = cp_base[cp_base['cross_posts'] > CROSS_POSTING_THRESHOLD]
cp_base = cp_base.groupby(["cross_posts", 'clid']).max()

cp_both = pd.merge(cp_base, cp_extra, on='key')

cp_both['Subreddit.j'] = cp_both['Subreddit.j_y']
cp_both['Subreddit.i'] = cp_both['Subreddit.i_y']

cp_both = cp_both.drop(columns =['Subreddit.i_y', 'Subreddit.j_y', 'Subreddit.i_x', 'Subreddit.j_x', 'key'])

cp_both['cross_posts_scaled'] = (cp_both['cross_posts'] - cp_both['cross_posts'].mean()) / cp_both['cross_posts'].std() 
cp_both['cross_posts_scaled'] = np.minimum(cp_both['cross_posts_scaled'], 3)
cp_both['cross_posts_scaled'] = np.maximum(cp_both['cross_posts_scaled'], -3)

cp_both.to_csv("datasets/cross_posting_lines.csv")



# AUTHOR SIMILARITY

auth = pairwise
auth = auth[auth['author_similarity'] > AUTHOR_SIMILARITY_THRESHOLD]
auth.to_csv("datasets/author_similarity.csv")

# TERM SIMILARITY

term = pairwise
term = term[term['term_similarity'] > TERM_SIMILARITY_THRESHOLD]
term.to_csv("datasets/term_similarity.csv")