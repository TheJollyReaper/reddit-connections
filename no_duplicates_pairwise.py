import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import csv 


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