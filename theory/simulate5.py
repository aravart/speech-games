import heapq
import itertools
import pandas
import tqdm
import random
import copy
import unittest

verbose = False


class Block(object):
    def __init__(self, name, next=None):
        self.name = name
        self.next = next

    def __hash__(self):
        return hash(repr(self))

    def size(self):
        return 1 + (self.next.size() if self.next else 0)

    def positions(self, current=[]):
        move = current + ['R']
        if self.next:
            return [current] + self.next.positions(move)
        else:
            return [current, move]

    def append(self, block):
        if self.next:
            self.next.append(block)
        else:
            self.next = block

    def insertAt(self, pos, block, top=None):
        if not top:
            top = self
        if pos == []:
            block.append(self)
            return block
        elif pos == ['R']:
            block.append(self.next)
            self.next = block
            return top
        else:
            return self.next.insertAt(pos[1:], block, top)

    def __repr__(self):
        return str(self.name) + ("," + repr(self.next) if self.next else "")

    def __eq__(self, other):
        if isinstance(other, self.__class__):
            return self.name == other.name and self.next == other.next
        else:
            return False


class EmptyBlock(Block):
    def __init__(self):
        super(EmptyBlock, self).__init__(())

    def size(self):
        return 0
        return 1 + (self.next.size() if self.next else 0)

    def positions(self, current=[]):
        return [[]]

    def append(self, block):
        return block

    def insertAt(self, pos, block, top=None):
        if pos == []:
            return block

    def __eq__(self, other):
        return isinstance(other, self.__class__)


class RepeatBlock(Block):
    def __init__(self, times, body=None, next=None):
        super(RepeatBlock, self).__init__('R', next)
        self.times = times
        self.body = body

    def size(self):
        return super(RepeatBlock, self).size() + (self.body.size() if self.body else 0)

    def __repr__(self):
        return "R" + str(self.times) + "(" + (repr(self.body if self.body else "")) + ")" + ("," + repr(self.next) if self.next else "")

    def positions(self, current=[]):
        follow = super(RepeatBlock, self).positions(current)
        if self.body:
            follow += self.body.positions(current + ['D'])
        else:
            follow += [current + ['D']]
        return follow

    # def getPos(self, pos):
    #     if pos[:2] == [0, 'D']:
    #         return self.body.getPos(pos[2:])
    #     else:
    #         return super(RepeatBlock, self).getPos(pos)

    def insertAt(self, pos, block, top=None):
        if not top:
            top = self
        if pos == ['D']:
            block.append(self.body)
            self.body = block
            return top
        elif len(pos) > 0 and pos[0] == 'D':
            return self.body.insertAt(pos[1:], block, top)
        else:
            return super(RepeatBlock, self).insertAt(pos, block, top)

    def __eq__(self, other):
        if isinstance(other, self.__class__):
            return self.times == other.times and self.body == other.body and self.next == other.next
        else:
            return False


def insertAll(src, target):
    res = []
    for pos in src.positions():
        res.append(copy.deepcopy(src).insertAt(pos, copy.deepcopy(target)))
    return res


def enum(maxSize, basics, repeats):
    res = []
    prims = [Block(i) for i in range(basics)] + \
            [RepeatBlock(i) for i in range(repeats)]
    res.append(prims)
    for i in range(maxSize-1):
        newLayer = []
        last = res[-1]
        for node in last:
            for p in prims:
                newLayer += insertAll(node, p)
        res.append(list(set(newLayer)))
    return res


class Node:
    def __init__(self, x):
        self.x = x
        self.edges = []
        self.accept = []
        self.accept_criterion = []
        self.parents = []

    def __repr__(self):
        return str(self.x)


def construct(maxSize=3,
              basics=3,
              repeats=3,
              connectAhead=1,
              undirected=False):
    edgetypes = enum(connectAhead, basics, repeats)
    # Make all the vertices
    v = [EmptyBlock()] + \
        [i for layer in enum(maxSize, basics, repeats) for i in layer]
    # Add make nodes of them
    v = dict(zip(v, map(Node, v)))
    for node in v.values():
        # If the node is not a leaf
        if node.x.size() < maxSize:
            # print "Adding edges to ", node.x
            # For each layer to connect it to
            for j in range(min(connectAhead, maxSize-node.x.size())):
                # For each successor
                for e in edgetypes[j]:
                    # print "Considering", e
                    children = set(insertAll(node.x, e))
                    # print children
                    for s in children:
                        node.edges.append(v[s])
                        node.accept_criterion.append(e)
                        v[s].parents.append(node)
                        if undirected:
                            v[s].edges.append(node)
                            v[s].accept_criterion.append(e)
    return v

# def construct(k=3, d=3, m=3, undirected=False):
#     v = []
#     for i in range(d+1):
#         v += list(itertools.product(range(k), repeat=i))
#     v = dict(zip(v, map(Node, v)))
#     for node in v.values():
#         if len(node.x) < d:
#             for j in range(min(m, d-len(node.x))):
#                 for c, s in succ(node.x, k, j+1):
#                     node.edges.append(v[s])
#                     node.accept_criterion.append(c)
#                     v[s].parents.append(node)
#                     if undirected:
#                         v[s].edges.append(node)
#                         v[s].accept_criterion.append(c)
#     # if undirected:
#     #     for node in v.values():
#     #         for child in node.edges:
#     #             child.edges.append(node)


# def succ(x, k, j=1):
#     res = [(c, x[:i] + c + x[i:])
#            for c in itertools.product(range(k), repeat=j)
#            for i in range(len(x)+1)]
#     res.sort(key=lambda x: x[1])
#     res = list(s for s, _ in itertools.groupby(res))
#     return res


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
            # The accept criterion are a list of meta data that align with the edges
            # And prob is a function that takes that information and returns some probability
            v.accept.append(random.uniform(0, 1) < prob(v.accept_criterion[i]))


def stochasticedges(n):
    return map(lambda x: x[1], filter(lambda x: x[0], zip(n.accept, n.edges)))


def path(prev, source, target):
    path = [target]
    while path[0] != source:
        path.insert(0, prev[path[0]])
    return path


def simulate(n=100,
             maxSize=3,
             basics=3,
             repeats=3,
             connectAhead=3,
             undirected=False,
             probabilityVectorsToTest=None,
             targets=None):
    """Simulates search

    Args:
    n: The number of samples per probability
    k: The size of the alphabet
    d: The size of the largest node in the graph (depth)
    m: Edges are up to m blocks larger than their source
    all_ps: The set of probability values of p_i to test,
    default being all of them from [0,0.1,...,1.0] r the k different types
    """

    # Construct graph
    v = construct(maxSize, basics, repeats, connectAhead, undirected)
    # Construct a map from the edge types to an index for the probability vector
    edgetypes = [i for layer in enum(connectAhead, basics, repeats) for i in layer]
    edgeTypeIndex = dict(zip(edgetypes, range(len(edgetypes))))

    source = v[EmptyBlock()]
    if targets:
        # User supplied function to pull a set of targets from graph
        targets = targets(v)
    else:
        # Default is all nodes at deepst layer
        targets = filter(lambda x: x.x.size() == maxSize, v.values())
    res = []
    # Must think about how many edge types there are, for this it's basics + repeats
    # If there is more than one type, connectAhead > 1 doesn't leave the edge type well-defined
    # ps is just the set of probability vectors to get results on
    #ps = ps or list(itertools.product(range(11), repeat=len(edgetypes)))
    probabilityVectorsToTest = probabilityVectorsToTest or [map(lambda p: p / 10.0, vector) for vector in list(itertools.product(range(11), repeat=len(edgetypes)))]
    for i in tqdm.trange(len(probabilityVectorsToTest)):
        ps = probabilityVectorsToTest[i]
        for _ in range(n):
            # p is a vector of probabilities, one per edge type
            # p = map(lambda i: i / 10.0, ps[i])
            # x is going to be a list of the block that was added and I think looking up x[0] just means this only works for basic edges
            drop(v.values(), lambda x: ps[edgeTypeIndex[x]])
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
                print p, found, l, explored, target
    columns = tuple(map(lambda x: 'p' + str(edgetypes[x]), range(len(edgetypes))) + ['found', 'length', 'explored', 'target'])
    df = pandas.DataFrame(res, columns=columns)
    return df

# Okay, we want to make this work either for one p per type or just a single p easily
# Alternatively, make simulate_small a substep where you are given a particular probability and a target
# The first is easy: just pass in a vector of all the same value: but you don't know the number of edge types!
# The latter is a callback on the graph

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


class Tests(unittest.TestCase):
    def test_positions(self):
        pos = Block('M', RepeatBlock(2)).positions()
        goal = [[], ['R'], ['R', 'R'], ['R', 'D']]
        self.assertEqual(goal, pos)

    def test_insert(self):
        pos = ['R', 'D', 'D', 'R']
        x = Block('T', RepeatBlock(2, RepeatBlock(3, Block('M'))))
        x.insertAt(pos, Block('U'))
        self.assertEqual('T,R2(R3(M,U))', str(x))

    def test_insertall(self):
        x = Block('T', RepeatBlock(2, RepeatBlock(3, Block('M'))))
        y = insertAll(x, Block('U'))
        self.assertEquals(7, len(y))

    def test_construct(self):
        g = construct(2, 1, 1, 1)
        self.assertEquals(2, len(g[EmptyBlock()].edges))

    def test_parameter_per_type(self):
        v = [[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.5, 0.5]]
        df = simulate(100, 2, 2, 0, 1, probabilityVectorsToTest=v)
        df['target'] = df['target'].apply(str)
        means = df.groupby(['p0','p1','target']).mean()
        self.assertEquals(0.0, means.loc[0.0,1.0,"0,1"].found)
        self.assertEquals(0.0, means.loc[0.0,1.0,"1,0"].found)
        self.assertEquals(1.0, means.loc[0.0,1.0,"1,1"].found)
        self.assertEquals(1.0, means.loc[1.0,0.0,"0,0"].found)

def runTests():
    unittest.main(exit=False)
