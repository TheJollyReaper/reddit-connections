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
from sympy import maximum

att = pd.read_csv("datasets/subreddit_attributes.csv")

att['interactions'] = att['N_comments'] / att['N_posts']
att['links'] = np.maximum(0, att['N_posts'] - att['N_self_posts'] - att['N_media_posts'])
att['NSFW_%'] = att['N_nsfw_posts'] / att['N_posts']
att['comment_moderation_%'] = att['N_deleted_comments'] / att['N_comments']
att['post_moderation_%'] = att['N_deleted_posts'] / att['N_posts']
att['text_posts_%'] = att['N_self_posts'] / att['N_posts']
att['media_%'] = att['N_media_posts'] / att['N_posts']
att['links_%'] = att['links'] / att['N_posts']


def variables_to_radii(variables):
    for var in variables:
        new_col_name = var + "_radius"
        att[new_col_name] = (att[var] - att[var].mean()) / att[var].std()  
        att[new_col_name] = np.maximum(att[new_col_name], -3)
        att[new_col_name] = np.minimum(att[new_col_name], 3)
        att[new_col_name] = att[new_col_name] + 4
        att[new_col_name] = np.sqrt(att[new_col_name])


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
             'interactions',
             'links',
             'NSFW_%',
             'comment_moderation_%',
             'post_moderation_%',
             'text_posts_%',
             'media_%',
             'links_%'
             ]


variables_to_radii(variables)

att.to_csv("datasets/subreddit_attributes_scaled.csv")