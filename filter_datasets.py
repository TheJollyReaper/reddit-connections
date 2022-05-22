# Size Strategy

# 1. Convert the variable to a z-score
# 2. Convert z-scores over 3 to 3 and under -3 to -3. 
#     There are, by definition, less than 0.3% of data in this area (outliers), 
#     and these can make some bubbles too small to see or too big and crowding the vizualization.
# 3. Add 4 to the z-scores so the scores go from 1-7
# 4. Take the square root of the z-score so the z-score is shown as the area, 
#     not the radius of the bubble
# 5. save to csv in datasets folder as "subreddit_attributes_scaled.csv"

import pandas as pd
import numpy as np

attributes = pd.read_csv("datasets/subreddit_attributes.csv")

attributes['interactions'] = attributes['N_comments'] / attributes['N_posts']

def variables_to_radii(variables):
    for var in variables:
        new_col_name = var + "_radius"
        attributes[new_col_name] = (attributes[var] - attributes[var].mean()) / attributes[var].std()  
        attributes[new_col_name] = np.maximum(attributes[new_col_name], -3)
        attributes[new_col_name] = np.minimum(attributes[new_col_name], 3)
        attributes[new_col_name] = attributes[new_col_name] + 4
        attributes[new_col_name] = np.sqrt(attributes[new_col_name])


variables = ['mean_comment_score',
             'var_comment_score',
             'med_comment_score',
             'N_comments',
             'N_distinct_commenters',
             'N_deleted_comments',
             'mean_comment_length',
             'var_comment_length',
             'N_stickied_comments',
             'mean_post_score',
             'var_post_score',
             'med_post_score',
             'N_posts',
             'N_distinct_posters',
             'N_deleted_posts',
             'N_self_posts',
             'N_gilded_posts',
             'N_media_posts',
             'N_nsfw_posts',
             'total_posts_selftext_length',
             'max_subscribers',
             'interactions'
             ]

variables_to_radii(variables)

attributes.to_csv("datasets/subreddit_attributes_scaled.csv")