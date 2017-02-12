import heapq
import itertools
import numpy
import pandas
import random

verbose = False


class Node:
    def __init__(self, x):
        self.x = x
        self.edges = []
        self.accept = []

    def __repr__(self):
        return str(self.x)


def construct(k, depth):
    res = []
    for i in range(depth+1):
        res += list(itertools.product(range(k), repeat=i))
    return res


def succ(x, k, j=1):
    res = [x[:i] + c + x[i:]
           for c in itertools.product(range(k), repeat=j)
           for i in range(len(x)+1)]
    res.sort()
    res = list(s for s, _ in itertools.groupby(res))
    return res


def dijkstra(vs, edges, source, target):
    h = []
    prev = {}
    dist = {}
    q = set([source])
    heapq.heappush(h, (0, source))
    dist[source] = 0
    explored = 0
    while q:
        cost, u = heapq.heappop(h)
        explored += 1
        if verbose:
            print cost, u
        q.remove(u)
        if u == target:
            return True, prev, explored
        for e in edges(u):
            alt = cost + 1
            if e not in dist or alt < dist[e]:
                q.add(e)
                heapq.heappush(h, (alt, e))
                dist[e] = alt
                prev[e] = u
    return False, prev, explored


def prune(vs, accept=0.5):
    for v in vs:
        v.accept = [random.uniform(0, 1) < accept for _ in range(len(v.edges))]


def stochasticedges(n):
    return map(lambda x: x[1], filter(lambda x: x[0], zip(n.accept, n.edges)))


def path(prev, source, target):
    path = [target]
    while path[0] != source:
        path.insert(0, prev[path[0]])
    return path


def simulate(n=100, k=3, d=3, m=3, undirected=False):
    """Simulates search

    Args:
    n: The number of samples per probability
    k: The size of the alphabet
    d: The size of the largest node in the graph (depth)
    m: Edges are up to m blocks larger than their source
    """

    v = construct(k, d)
    v = dict(zip(v, map(Node, v)))

    for node in v.values():
        if len(node.x) < d:
            for j in range(min(m, d-len(node.x))):
                for s in succ(node.x, k, j+1):
                    node.edges.append(v[s])
                    if undirected:
                        v[s].edges.append(node)
    # if undirected:
    #     for node in v.values():
    #         for child in node.edges:
    #             child.edges.append(node)

    source = v[()]
    targets = filter(lambda x: len(x.x) == d, v.values())
    res = []
    for p in [i / 10.0 for i in range(11)]:
        for _ in range(n):
            prune(v.values(), accept=p)
            target = targets[random.randint(0, len(targets)-1)]
            found, prev, explored = dijkstra(v.values(),
                                             stochasticedges,
                                             source,
                                             target)
            l = None
            if found:
                l = len(path(prev, source, target))-1
            res.append((p, found, l, explored, target))
            if verbose:
                print p, found, l, explored, target
    df = pandas.DataFrame(res, columns = ('p','found','length','explored','target'))
    return df


def plot_1(df, show=True):
    import matplotlib.pyplot as plt
    df.groupby(['p']).mean()['found'].plot()
    plt.title('Proportion of targets found')
    plt.xlabel('Probability of retaining edge')
    if show:
        plt.show()


def plot_2(df, show=True):
    import matplotlib.pyplot as plt
    df[df['found']].groupby(['p']).mean()['length'].plot(kind='bar')
    plt.title('Mean path length if found')
    plt.xlabel('Probability of retaining edge')
    if show:
        plt.show()


def plot_3(df, show=True):
    import matplotlib.pyplot as plt
    df.groupby(['p']).mean()['explored'].plot(kind='bar')
    plt.title('Mean nodes expanded')
    plt.xlabel('Probability of retaining edge')
    if show:
        plt.show()
