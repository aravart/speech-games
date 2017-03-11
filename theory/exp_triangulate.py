from moralize import *
from simulate2 import *

g = construct(3, 3, 3)
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
dg.show(pos(g))

ug = dg.to_undirected()
triangulate(ug.v, ug.neighbors, ug.add_edge)

ug.show(pos(g))

print len(ug.v)
print len(ug.e)
