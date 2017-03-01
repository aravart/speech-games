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
        self.accept_criterion = []
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
                for c, s in succ(node.x, k, j+1):
                    node.edges.append(v[s])
                    node.accept_criterion.append(c)
                    v[s].parents.append(node)
                    if undirected:
                        v[s].edges.append(node)
                        v[s].accept_criterion.append(c)
    # if undirected:
    #     for node in v.values():
    #         for child in node.edges:
    #             child.edges.append(node)

    return v


def succ(x, k, j=1):
    res = [(c, x[:i] + c + x[i:])
           for c in itertools.product(range(k), repeat=j)
           for i in range(len(x)+1)]
    res.sort(key=lambda x: x[1])
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


def drop(vs, prob):
    for v in vs:
        # v.accept = [random.uniform(0, 1) < accept for _ in range(len(v.edges))]
        v.accept = []
        for i in range(len(v.edges)):
            v.accept.append(random.uniform(0, 1) < prob(v.accept_criterion[i]))


def stochasticedges(n):
    return map(lambda x: x[1], filter(lambda x: x[0], zip(n.accept, n.edges)))


def path(prev, source, target):
    path = [target]
    while path[0] != source:
        path.insert(0, prev[path[0]])
    return path


def simulate(n=100, k=3, d=3, m=3, undirected=False, all_ps=None):
    """Simulates search

    Args:
    n: The number of samples per probability
    k: The size of the alphabet
    d: The size of the largest node in the graph (depth)
    m: Edges are up to m blocks larger than their source
    all_ps: The set of probability values of p_i to test,
    default being all of them from [0,0.1,...,1.0] r the k different types
    """

    v = construct(k, d, m, undirected)

    source = v[()]
    targets = filter(lambda x: len(x.x) == d, v.values())
    res = []
    all_ps = all_ps or list(itertools.product(range(11), repeat=k))
    for i in tqdm.trange(len(all_ps)):
        for _ in range(n):
            ps = map(lambda i: i / 10.0, all_ps[i])
            drop(v.values(), lambda x: ps[x[0]])
            target = targets[random.randint(0, len(targets)-1)]
            found, prev, explored = dijkstra(v.values(),
                                             stochasticedges,
                                             source,
                                             target)
            l = None
            if found:
                l = len(path(prev, source, target))-1
            res.append(ps + [found, l, explored, target])
            if verbose:
                print ps, found, l, explored, target
    df = pandas.DataFrame(res, columns=tuple(map(lambda x: 'p' + str(x), range(k)) + ['found', 'length', 'explored', 'target']))
    return df

def simulate_small(target, n=100, k=3, d=3, m=3, p=0.5, undirected=False):
    """Simulates search for a given target and p

    Args:
    n: The number of samples per probability
    k: The size of the alphabet
    d: The size of the largest node in the graph (depth)
    m: Edges are up to m blocks larger than their source
    """

    v = construct(k, d, m, undirected)
    source = v[()]
    target = v[target]
    res = []
    for _ in tqdm.trange(n):
        drop(v.values(), lambda _: p)
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
    df = pandas.DataFrame(res, columns=('p', 'found', 'length', 'explored', 'target'))
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


def dfs(n, res=[]):
    """Topological sort"""
    for child in reversed(n.edges):
        dfs(child, res)
    res.append(n)
    return res


def count(v):
    return (len(v.values()), sum(map(lambda x: len(x.edges), v.values())))


def ancestors(leaf):
    current = [leaf]
    visited = []
    while current:
        c = current.pop()
        visited.append(c)
        for p in c.parents:
            if p not in visited and p not in current:
                current.append(p)
    return visited


def prune(v, s):
    for n in v.values():
        if n not in s:
            del v[n.x]
        else:
            for e in list(n.edges):
                if e not in s:
                    n.edges.remove(e)
