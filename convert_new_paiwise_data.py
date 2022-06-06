import pandas as pd
import numpy as np


columns_used = ['Estimate', 'Std. Error', 't value', 'Pr(>|t|)', 'clid',
                'Subreddit.j', 'Subreddit.i', 'cross_posts', 
                'core-periphery', 'submissions_i', 'submissions_j',
                'core-periphery_log', 'author_similarity', 'term_similarity']

# columns_used = ['Estimate', 'Std. Error', 't value', 'Pr(>|t|)', 'clid',
#                 'Subreddit.j', 'Subreddit.i', 'cross_posts', 'share_stem', 'levenstein', 
#                 'core-periphery', 'submissions_i', 'submissions_j',
#                 'core-periphery_log', 'author_similarity', 'term_similarity']

df = pd.read_feather("datasets/pairwise_variables.feather")
df = df.rename(columns={'subreddit.i':"Subreddit.i",
                        'subreddit.j':"Subreddit.j",
                        'n_cross_posts':'cross_posts',
                        'coreperiph_ij_sym':'core-periphery',
                        'N_posts.i':'submissions_i',
                        'N_posts.j':'submissions_j'})

df['core-periphery_log'] = np.log(df['core-periphery'])
                        

df = df.loc[:,columns_used]
df.to_csv("datasets/pairwise_variables.csv")
