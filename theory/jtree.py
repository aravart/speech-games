from optparse import OptionParser
from pickle import dump
from simulate import construct
from pgmpy.models import BayesianModel
from pgmpy.factors import TabularCPD
from pgmpy.inference import BeliefPropagation

parser = OptionParser()
parser.add_option("--d", type="int", default=2)
parser.add_option("--p", type="float", default=0.5)
options, _ = parser.parse_args()

d = options.d
p = options.p


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

dump(ms, "d_%s.pkl" % d)

for m in ms.values():
    print(m)
