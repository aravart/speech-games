from simulate5 import *

# The goal here is to compare graph structure and performance with repeats and without.

# First, let's make a 2x2 table of vertex and edge counts, based on the number of items

maxSize = 3
basics = 3
repeats = 3
edges = [[0 for j in range(repeats+1)] for i in range(basics+1)]
vertices = [[0 for j in range(repeats+1)] for i in range(basics+1)]

for i in range(basics+1):
    for j in range(repeats+1):
        g = construct(maxSize, i, j)
        vertices[i][j] = len(g.values())
        edges[i][j] = g[EmptyBlock()].countedges()

# For example, what's the difference in connectivity between 3 of each and 6 of one?


def summarize(g):
    return (len(g.values()), sum([len(n.edges) for n in g.values()]))

# maxSize = 5
# sixoh = construct(maxSize, 6, 0)
# ohsix = construct(maxSize, 0, 6)
# threethree = construct(maxSize, 3, 3)

# print summarize(sixoh)
# print summarize(ohsix)
# print summarize(threethree)

# >>> summarize(sixoh)
# (9331, 599880)
# >>> summarize(ohsix)
# (345895, 5982096)
# >>> summarize(threethree)
# (103687, 2563770)

dfso = simulate(1000, 3, 6, 0, 1, probabilityVectorsToTest=[6 * [0.5]])
dftt = simulate(1000, 3, 3, 3, 1, probabilityVectorsToTest=[6 * [0.5]])
dfos = simulate(1000, 3, 0, 6, 1, probabilityVectorsToTest=[6 * [0.5]])

print dfso.mean().found
print dftt.mean().found
print dfos.mean().found
