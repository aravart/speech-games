from optparse import OptionParser
import pandas
# import matplotlib.pyplot as plt
from simulate import simulate

parser = OptionParser()
parser.add_option("--max-d", type="int", default=4)
options, _ = parser.parse_args()

res = pandas.DataFrame()
for d in range(1, options.max_d + 1):
    print "\n\nd=", d, "\n"
    df = simulate(n=1000, k=3, d=d, m=1, progress=True)
    s = df.groupby(['p']).mean()['found']
    s.name = d
    res = res.append(s)
res = res.transpose()
res.to_pickle('mod/barplots_d_%s.pkl' % options.max_d)

# res.plot(kind='bar')
# plt.show()
