import unittest
from collections import deque


def bfs(source, neighbors):
    res = []
    visited = set()
    queue = deque([source])
    while queue:
        v = queue.popleft()
        visited.add(v)
        res.append(v)
        for n in neighbors(v):
            if n not in visited:
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
    seen = []
    for v in vertices:
        seen.append(v)
        v_neighbors = neighbors(v)
        for i in range(len(v_neighbors)):
            neighbor_i = v_neighbors[i]
            if neighbor_i not in seen:
                for j in range(i+1, len(v_neighbors)):
                    neighbor_j = v_neighbors[j]
                    if neighbor_j not in seen and neighbor_j not in neighbors(neighbor_i):
                        addedge(neighbor_i, neighbor_j)


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
        self.v = v
        self.e = e

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
        self.v = v
        self.e = e
        self.edges = {}
        for v in v:
            self.edges[v] = []
        for e in e:
            self.edges[e[0]].append(e[1])
            self.edges[e[1]].append(e[0])

    def has_edge(self, u, v):
        return v in self.edges[u]

    def neighbors(self, v):
        return self.edges[v]

    def add_edge(self, u, v):
        self.edges[u].append(v)
        self.edges[v].append(u)
        self.e.append((u, v))


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

# if __name__ == '__main__':
#     unittest.main()
