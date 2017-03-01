import pandas
import math

alpha = 0.1
beta = 0.95


def compute_n(p):
    return math.log(1 - p) / math.log(1 - alpha)

df = pandas.read_pickle('mod/4d.pkl')
df = df.groupby(['p0', 'p1', 'p2']).mean()['found'].reset_index()

print "All feasible values..."

print df[df['found'] > beta]

print "Minimum values..."

df = df[df['found'] > beta].groupby(['p0', 'p1']).min()['p2'].reset_index()

print df

ls = map(list, df.values)

for l in ls:
    if 1.0 not in l:
        l = map(lambda x: round(x,2), l)
        k = sum(map(compute_n, l))
        print l, k
