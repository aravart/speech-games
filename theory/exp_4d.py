import itertools
import matplotlib.pyplot as plt
from simulate2 import simulate


df = simulate(n=1000, m=1, k=2, d=5)
df.to_pickle('mod/3d.pkl')

# df.groupby(['p0','p1']).mean()['found']

df = simulate(n=1000, m=1, k=3, d=5)
df.to_pickle('mod/4d.pkl')

# df.groupby(['p0','p1','p2']).mean()['found']

# k = 3
# all_ps = list(itertools.product(range(11), repeat=k))
# df = simulate(n=10000, m=1, k=3, d=5, all_ps=all_ps[:11])
# df.groupby(['p0','p1','p2']).mean()['found']
