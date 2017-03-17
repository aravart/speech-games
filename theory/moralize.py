import unittest
from collections import deque


def bfs(source, neighbors):
    res = []
    visited = set([source])
    queue = deque([source])
    while queue:
        v = queue.popleft()
        res.append(v)
        for n in neighbors(v):
            if n not in visited:
                visited.add(n)
                queue.append(n)
    return res


def moralize(vertices, parents, adjacent, addedge):
    for v in vertices:
        v_parents = parents(v)
        for i in range(len(v_parents)):
            for j in range(i+1, len(v_parents)):
                if not adjacent(v_parents[i], v_parents[j]):
                    addedge(v_parents[i], v_parents[j])


def triangulate(vertices, neighbors, addedge, reorder=True):
    if reorder:
        vertices = bfs(vertices[0], neighbors)
    seen = set()
    for v in vertices:
        seen.add(v)
        v_neighbors = neighbors(v)
        for i in range(len(v_neighbors)):
            neighbor_i = v_neighbors[i]
            if neighbor_i not in seen:
                for j in range(i+1, len(v_neighbors)):
                    neighbor_j = v_neighbors[j]
                    if neighbor_j not in seen and neighbor_j not in neighbors(neighbor_i):
                        addedge(neighbor_i, neighbor_j)


def cliquegraphvertices(vertices, neighbors, reorder=True):
    if reorder:
        vertices = bfs(vertices[0], neighbors)
    cliques = set()
    for v in vertices:
        clique = [v]
        v_neighbors = neighbors(v)
        for n in v_neighbors:
            viable = True
            for c in clique:
                if n not in neighbors(c):
                    viable = False
                    break
            if viable:
                clique.append(n)
        cliques.add(tuple(sorted(clique)))
    return cliques


def kruskal(vertices, edges, weight):
    parents = {}

    for v in vertices:
        parents[v] = v

    def find(u):
        while parents[u] != u:
            u = parents[u]
        return u

    def union(u, v):
        parents[find(v)] = find(u)

    mst = []
    edges = sorted(edges, key=lambda x: weight(x))
    for e in edges:
        if find(e[0]) != find(e[1]):
            mst.append(e)
            union(e[0], e[1])
    return mst


def cliquegraph(vertices, neighbors, reorder=True):
    v = list(cliquegraphvertices(vertices, neighbors, reorder))
    ug = UndirectedGraph(v, [])
    for i in range(len(v)):
        for j in range(i+1, len(v)):
            if len(set(v[i]).intersection(set(v[j]))) > 0:
                ug.add_edge(v[i], v[j])
    return ug


class Graph:
    def to_networkx(self):
        import networkx as nx
        g = nx.Graph()
        for v in self.v:
            g.add_node(v)
        for e in self.e:
            g.add_edge(e[0], e[1])
        return g

    def show(self, pos=None):
        import networkx as nx
        import matplotlib.pyplot as plt
        nx.draw_networkx(self.to_networkx(), pos=pos, with_labels=True)
        plt.show()


class DirectedGraph(Graph):
    def __init__(self, v, e):
        self.v = list(v)
        self.e = list(e)

        # Compute parents
        self.parents = {}
        for u in v:
            self.parents[u] = []
        for edge in e:
            self.parents[edge[1]].append(edge[0])

    def adjacent(self, u, v):
        return u in self.parents[v] or v in self.parents[u]

    def to_undirected(self):
        return UndirectedGraph(self.v, self.e)

    def add_edge(self, u, v):
        self.e.append((u, v))
        self.parents[v].append(u)

    def moralize(self):
        moralize(self.v,
                 lambda x: self.parents[x],
                 self.adjacent,
                 self.add_edge)


class UndirectedGraph(Graph):
    def __init__(self, v, e):
        self.v = list(v)
        self.e = list(e)
        self.edges = {}
        for v in v:
            self.edges[v] = []
        for e in e:
            self.edges[e[0]].append(e[1])
            self.edges[e[1]].append(e[0])
        self.triangulated = False

    def has_edge(self, u, v):
        return v in self.edges[u]

    def neighbors(self, v):
        return self.edges[v]

    def add_edge(self, u, v):
        self.edges[u].append(v)
        self.edges[v].append(u)
        self.e.append((u, v))

    def triangulate(self, reorder=False):
        if reorder:
            self.v = bfs(self.v[0], self.neighbors)
        triangulate(self.v, self.neighbors, self.add_edge, False)
        self.triangulated = True

    def to_cliquegraph(self):
        if not self.triangulated:
            self.triangulate()
        return cliquegraph(self.v, self.neighbors, False)

    def to_junctiontree(self):
        cg = self.to_cliquegraph()
        weights = {}
        for e in cg.e:
            weights[e] = -len(set(e[0]).intersection(set(e[1])))
        mst = kruskal(cg.v, cg.e, lambda x: weights[x])
        return UndirectedGraph(cg.v, mst)


class Tests(unittest.TestCase):
    def bn(self, n, d):
        return [] if n >= 2 ** (d-1) else [n*2, n*2+1]

    def test_bfs(self):
        depth = 3
        self.assertEqual(list(range(1, 2 ** depth)),
                         bfs(1, lambda x: self.bn(x, depth)))

    def test_triangulate_1(self):
        # https://www.cs.cmu.edu/~epxing/Class/10708-05/Slides/ve2.pdf
        v = ['C', 'D', 'S', 'I', 'L', 'H', 'J', 'G']
        e = [('C', 'D'),
             ('D', 'I'),
             ('D', 'G'),
             ('I', 'G'),
             ('I', 'S'),
             ('G', 'H'),
             ('G', 'L'),
             ('G', 'J'),
             ('S', 'L'),
             ('S', 'J'),
             ('L', 'J'),
             ('H', 'J')]
        ug = UndirectedGraph(v, e)
        self.assertFalse(ug.has_edge('I', 'L'))
        self.assertFalse(ug.has_edge('I', 'J'))
        triangulate(ug.v, ug.neighbors, ug.add_edge, False)
        self.assertTrue(ug.has_edge('I', 'L'))
        self.assertTrue(ug.has_edge('I', 'J'))
        self.assertEqual(14, len(ug.e))

    def test_triangulate_2(self):
        # Fig 1 in http://ac.els-cdn.com/0022247X70902829/1-s2.0-0022247X70902829-main.pdf
        v = [1, 2, 3, 4, 5, 6]
        e = [(1, 2),
             (1, 3),
             (1, 4),
             (1, 6),
             (2, 3),
             (2, 4),
             (2, 5),
             (3, 5),
             (3, 6),
             (4, 5),
             (4, 6),
             (5, 6)]
        ug = UndirectedGraph(v, e)
        triangulate(ug.v, ug.neighbors, ug.add_edge, False)
        self.assertTrue(ug.has_edge(2, 6))  # for [2,4,6,3,2]
        self.assertTrue(ug.has_edge(3, 4))  # for [1,4,5,3,1]
        self.assertEqual(14, len(ug.e))

    def test_cliquegraphvertices(self):
        v = [1, 2, 3, 4, 5, 6]
        e = [(1, 2),
             (1, 3),
             (2, 3),
             (3, 4),
             (4, 5),
             (4, 6),
             (5, 6)]
        ug = UndirectedGraph(v, e)
        ug.triangulate()
        cliques = cliquegraphvertices(ug.v, ug.neighbors, False)
        self.assertTrue((4, 5, 6) in cliques)
        self.assertTrue((3, 4) in cliques)
        self.assertTrue((1, 2, 3) in cliques)
        self.assertEquals(3, len(cliques))

    def test_kruskal(self):
        v = ['a', 'b', 'c', 'd', 'e', 'f']
        e = {('a', 'b'): 5,
             ('a', 'c'): 6,
             ('a', 'd'): 4,
             ('b', 'c'): 1,
             ('b', 'd'): 2,
             ('c', 'd'): 2,
             ('c', 'e'): 5,
             ('c', 'f'): 3,
             ('d', 'f'): 4,
             ('e', 'f'): 4}
        ans = [('a', 'd'), ('b', 'c'), ('c', 'd'), ('c', 'f'), ('e', 'f')]
        self.assertEquals(ans, sorted(kruskal(v, e.keys(), lambda x: e[x])))

    def test_junctiontree(self):
        v = ['a', 'b', 'c', 'd', 'e']
        e = [('a', 'b'),
             ('a', 'd'),
             ('b', 'c'),
             ('b', 'd'),
             ('c', 'd'),
             ('c', 'e'),
             ('d', 'e')]
        ug = UndirectedGraph(v, e)
        jt = ug.to_junctiontree()
        self.assertEqual(jt.v,
                         [('b', 'c', 'd'), ('a', 'b', 'd'), ('c', 'd', 'e')])
        self.assertEqual(jt.e,
                         [(('b', 'c', 'd'), ('a', 'b', 'd')),
                          (('b', 'c', 'd'), ('c', 'd', 'e'))])

# if __name__ == '__main__':
#     unittest.main()
