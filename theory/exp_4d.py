from simulate2 import simulate

df = simulate(n=1000, m=1, k=2, d=5)
df.to_pickle('mod/3d.pkl')

# df.groupby(['p0','p1']).mean()['found']

df = simulate(n=1000, m=1, k=3, d=5)
df.to_pickle('mod/4d.pkl')

# df.groupby(['p0','p1','p2']).mean()['found']
