import heapq
import itertools
import numpy
import pandas
import tqdm
import random

verbose = False


class Node:
    def __init__(self, x):
        self.x = x
        self.edges = []
        self.accept = []
        self.parents = []

    def __repr__(self):
        return str(self.x)


def construct(k=3, d=3, m=3, undirected=False):
    v = []
    for i in range(d+1):
        v += list(itertools.product(range(k), repeat=i))
    v = dict(zip(v, map(Node, v)))
    for node in v.values():
        if len(node.x) < d:
            for j in range(min(m, d-len(node.x))):
                for s in succ(node.x, k, j+1):
                    node.edges.append(v[s])
                    v[s].parents.append(node)
                    if undirected:
                        v[s].edges.append(node)
    # if undirected:
    #     for node in v.values():
    #         for child in node.edges:
    #             child.edges.append(node)

    return v


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


def simulate(n=100, k=3, d=3, m=3, undirected=False, progress=False):
    """Simulates search

    Args:
    n: The number of samples per probability
    k: The size of the alphabet
    d: The size of the largest node in the graph (depth)
    m: Edges are up to m blocks larger than their source
    """

    v = construct(k, d, m, undirected)

    source = v[()]
    targets = filter(lambda x: len(x.x) == d, v.values())
    res = []
    for i in tqdm.trange(11):
        for _ in tqdm.trange(n):
            p = i / 10.0
    # for p in [i / 10.0 for i in range(11)]:
    #     for _ in range(n):
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
    df = pandas.DataFrame(res, columns = ('p', 'found', 'length', 'explored', 'target'))
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


def plot_4(maxd=4, show=True):
    """Simulate probability of being found for a range of values"""
    import matplotlib.pyplot as plt
    res = pandas.DataFrame()
    for d in range(1, maxd+1):
        print "\n\nd=", d, "\n"
        df = simulate(n=1000, k=3, d=d, m=1, progress=True)
        s = df.groupby(['p']).mean()['found']
        s.name = d
        res = res.append(s)
    res.transpose().to_pickle('barplots.pkl')
    res.transpose().plot(kind='bar')
    if show:
        plt.show()


def dfs(n, res=[]):
    """Topological sort"""
    for child in reversed(n.edges):
        dfs(child, res)
    res.append(n)
    return res

# p = 0.5
# v = construct(m=1,d=2)
# tsort = list(reversed(dfs(v[()])))
# for n in v.values():
#     n.x = (None, n.x)
# for n in range(1,len(tsort)):
#     q = 1
#     tsort[n].x = (1, tsort[n].x)
#     q = 
#     # take all parents and multiply by p

# map(lambda n: n.parents, list(reversed(dfs(v[()]))))
