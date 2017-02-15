from optparse import OptionParser
from pickle import dump
from simulate import construct, prune, ancestors
from pgmpy.models import BayesianModel
from pgmpy.factors import TabularCPD
from pgmpy.inference import BeliefPropagation

parser = OptionParser()
parser.add_option("--p", type="float", default=0.5)
parser.add_option("--target", type="string", default="11")
parser.add_option("-s", action="store_true", dest="save")
options, _ = parser.parse_args()

p = options.p
target = tuple(map(int, list(options.target)))
d = len(target)

def compute_probabilities(p, l):
    zeros = []
    ones = []
    for i in range(2 ** l):
        bits = format(i, 'b').count('1')
        q = (1 - p) ** bits
        zeros.append(q)
        ones.append(1 - q)
    return [zeros, ones]

g = BayesianModel()
vs = construct(m=1, d=d)

prune(vs, ancestors(vs[target]))
# For d = 6, why a bug with the above but not the below?
# prune(vs, ancestors(vs[(0, 1, 0, 1, 1, 0)]))
# prune(vs, ancestors(vs[(0, 1, 0, 1, 1, 1)]))
# python jtree2.py --target 010110
# python jtree2.py --target 010111

for v in vs.values():
    for child in v.edges:
        g.add_edge(str(v), str(child))

for v in vs.values():
    if v.x == ():
        cpd = TabularCPD(str(v), 2, [[0.0], [1.0]])
    else:
        cpd = TabularCPD(str(v), 2,
                         compute_probabilities(p, len(v.parents)),
                         evidence=map(str, v.parents),
                         evidence_card=[2]*len(v.parents))
    # print(cpd)
    g.add_cpds(cpd)


bp = BeliefPropagation(g)
ms = bp.query(variables=map(str, vs.values()))

for m in ms.values():
    print(m)

if options.save:
    with open("%s.pkl" % "".join(map(str, target)), 'wb') as f:
        dump(ms, f)

# Now can we verify this with simulation?
