Datasets and their Meaning
Updated 5/26/2022


CATEGORY:   RAW DATA (not edited, directly from the source)
FILES:      pairwise_variables.csv, subreddit_attributes.csv
MEANING:    pairwise_variables.csv contains data about the similarities between subreddit_attributes
            subreddit_attributes.csv contains data about subreddit subreddit_attributes
USE:        create other datasets


CATEGORY:   SUBREDDIT BUBBLE RADIUS (subreddit attributes scaled)
FILES:      subreddit_attributes_scaled.csv
MEANING:    This is a dataset of all the subreddit attributes and their cooresponding radii.
            Using the script scale_attributes.py, this caps the major outliers in the data
            and takes the square root so that the radius surface area (not the radius), is
            proportional to the z-score.
USE:        Determine radii of subreddits based on the attribute.


CATEGORY:   EDITED PAIRWISE DATA (pairwise data without duplicates)
FILES:      small_pairwise.csv
MEANING:    This is a list of all unique pairs of data. For example, if there is a row of
            subreddits "dublin" and "ireland", there is NOT a row of "ireland" and "dublin".
            This is filtered from pairwise_variables.csv using the script at the bottom
            of filter_pairwise.py
USE:        Create pairwise datasets other than the mutualism/competition estimate


CATEGORY:   LINES: SMALL PAIRWISE DATA (creating initial lines in dashboard)
FILES:      author_lines.csv, cross_posting_lines.csv, estimate_lines.csv, term_similarity_lines.csv
MEANING:    These are small datasets with a pair of subreddits and a single similarity metric about them.
            There are only about 2000 rows per dataset so as not to crowd the data dashboard with lines,
            and these were made in the fiter_pairwise.py file.
USE:        Create lines between subreddits on dashboard.


CATEGORY:   HOVER TAG SIMILARITY DATASETS (long datasets with one main value to use for hover tags)
FILES:      author_similarity.csv, term_similarity.csv, cross_posting.csv, estimate_full.csv 
MEANING:    These files have a pair of subreddits, and a single similarity metric about them.
            All but the crossposting dataset have a "tag" associated with the value that interprets the similarity
            metric (i.e. "very similar", "not similar", etc).
USE:        Main use is for the values in the hover tag of lines between subreddits

