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

attributes = pd.read_csv("datasets/subreddit_attributes.csv")
base = attributes
base['interactions'] = base['N_comments'] / base['N_posts']
base['links'] = np.maximum(0, base['N_posts'] - base['N_self_posts'] - base['N_media_posts'])
base['NSFW_%'] = base['N_nsfw_posts'] / base['N_posts']
base['comment_moderation_%'] = base['N_deleted_comments'] / base['N_comments']
base['post_moderation_%'] = base['N_deleted_posts'] / base['N_posts']
base['text_posts_%'] = base['N_self_posts'] / base['N_posts']
base['media_%'] = base['N_media_posts'] / base['N_posts']
base['links_%'] = base['links'] / base['N_posts']




variables = ['mean_comment_score',
         #    'var_comment_score',
        #     'med_comment_score',
             'N_comments',
             'N_distinct_commenters',
          #   'N_deleted_comments',
             'mean_comment_length',
        #     'var_comment_length',
          #   'N_stickied_comments',
             'mean_post_score',
         #    'var_post_score',
         #    'med_post_score',
             'N_posts',
             'N_distinct_posters',
          #   'N_deleted_posts',
             'N_self_posts',
          #   'N_gilded_posts',
        #     'N_media_posts',
         #    'N_nsfw_posts',
             'total_posts_selftext_length',
             'max_subscribers',
             'interactions',
         #    'links',
            #  'NSFW_%',
            #  'comment_moderation_%',
            #  'post_moderation_%',
            #  'text_posts_%',
            #  'media_%',
            #  'links_%'
             ]


# def variables_to_radii(variables):
#     for var in variables:
#         new_col_name = var + "_radius"
#         att[new_col_name] = (att[var] - att[var].mean()) / att[var].std()  
#       #  att[new_col_name] = np.maximum(att[new_col_name], -3)
#     #    att[new_col_name] = np.minimum(att[new_col_name], 3)
#         att[new_col_name] = att[new_col_name] + 4
#         att[new_col_name] = np.sqrt(att[new_col_name])


def new_variables_to_radii(variables):
    for var in variables:
        new_col_name = var + "_radius"
        att2[new_col_name] = (att2[var] - att2[var].mean()) / att2[var].std() 
        att2[new_col_name] = np.maximum(att2[new_col_name], -3)
     #   att2[new_col_name] = np.minimum(att2[new_col_name], 3)
        att2[new_col_name] = att2[new_col_name] + 4
        att2[new_col_name] = np.sqrt(att2[new_col_name])
        print(var + " min: " + str(round(att2[new_col_name].min(), 2)) + " max: " + str(round(att2[new_col_name].max(), 2)))


#att = base
att2 = base

#variables_to_radii(variables)

new_variables_to_radii(variables)

#att.to_csv("datasets/subreddit_attributes_scaled.csv")

att2.to_csv("datasets/NEW_subreddit_attributes_scaled.csv")



variables2 = ['N_comments',
             'N_distinct_commenters',
             'N_deleted_comments',
             'mean_comment_length',
             'N_posts',
             'N_distinct_posters',
             'N_self_posts',
             'total_posts_selftext_length',
             'max_subscribers',
             'interactions',
             'links',
             ]


#def stats(variables, df):
 #   for var in variables:
  #      print(var + " max: " + str(np.round(df[var].max(), 2)) + '  min: ' + str(np.round(df[var].min(), 2)) + " avg: " + str(np.round(df[var].mean(), 2)))


#stats(variables2, att2)
