from moralize import *
from simulate2 import *

g = construct(3, 3, 1)
dg = DirectedGraph(g.keys(), [])
for u in g.values():
    for v in u.edges:
        dg.add_edge(u.x, v.x)


def pos(g):
    res = {}
    bylength = {}
    for n in g.values():
        l = len(n.x)
        if l not in bylength:
            bylength[l] = []
        bylength[l].append(n.x)
    max_width = len(bylength[max(bylength.keys())])
    for layer in bylength.values():
        width = len(layer)
        for i, node in enumerate(layer):
            res[node] = (float(i+1)/(width+1) * max_width, -len(node))
    return res

dg.moralize()
# dg.show(pos(g))

ug = dg.to_undirected()
ug.triangulate(True)

# ug.show(pos(g))

print len(ug.v)
print len(ug.e)

cg = ug.to_cliquegraph()
print map(len, cg.v)

# Write maximal cliques by checking elimination ordering neighbors
    # def maximal_cliques(self):
    #     if not self.triangulated:
    #         raise Exception('Graph must be first triangulated')

# And then MST for a clique tree!
