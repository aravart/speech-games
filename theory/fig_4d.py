from mpl_toolkits.mplot3d import Axes3D
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import numpy as np
import pandas
import pylab

# threedee = plt.figure().gca(projection='3d')
# threedee.scatter(df.index, df['H-L'], df['Volume'])
# threedee.set_xlabel('Index')
# threedee.set_ylabel('H-L')
# threedee.set_zlabel('Volume')
# plt.show()

# def func(x, y):
#     return x*(1-x)*np.cos(4*np.pi*x) * np.sin(4*np.pi*y**2)**2

# grid_x, grid_y = np.mgrid[0:1:100j, 0:1:200j]

# points = np.random.rand(1000, 2)
# values = func(points[:,0], points[:,1])


# from scipy.interpolate import griddata
# grid_z0 = griddata(points, values, (grid_x, grid_y), method='nearest')
# grid_z1 = griddata(points, values, (grid_x, grid_y), method='linear')
# grid_z2 = griddata(points, values, (grid_x, grid_y), method='cubic')

beta = 0.90

df = pandas.read_pickle('mod/4d.pkl')
df = df.groupby(['p0','p1','p2']).mean()['found']
df = df.reset_index()

# All points

fig = pylab.figure()
big = df[df['found'] > beta].as_matrix()
ax = Axes3D(fig)
ax.scatter(big[:, 0].tolist(), big[:, 1].tolist(), big[:, 2].tolist())
ax.set_xlim3d(0.0, 1.0)
ax.set_ylim3d(0.0, 1.0)
ax.set_zlim3d(0.0, 1.0)
plt.show()

# from scipy.interpolate import griddata
# points = df[range(3)].as_matrix()
# values = df[[3]].as_matrix()

fig = pylab.figure()
big = df[(df['found'] > beta) & (df['found'] < beta + 0.05)].as_matrix()
ax = Axes3D(fig)
ax.scatter(big[:, 0].tolist(), big[:, 1].tolist(), big[:, 2].tolist())
ax.set_xlim3d(0.0, 1.0)
ax.set_ylim3d(0.0, 1.0)
ax.set_zlim3d(0.0, 1.0)
plt.show()

# maybe you can use interpolation to get a finer grid of points
# maybe a better idea is to look for the minimum value of z exceeding some beta for a pair of values in x,y

big = df[df['found'] > beta].groupby(['p0','p1']).min()['p2'].reset_index().as_matrix()
fig = pylab.figure()
ax = Axes3D(fig)
ax.set_xlim3d(0.0, 1.0)
ax.set_ylim3d(0.0, 1.0)
ax.set_zlim3d(0.0, 1.0)
ax.plot_trisurf(big[:, 0].tolist(), big[:, 1].tolist(), big[:, 2].tolist())
plt.show()

# X = np.arange(-5, 5, 0.25)
# Y = np.arange(-5, 5, 0.25)
# X, Y = np.meshgrid(X, Y)
# R = np.sqrt(X ** 2 + Y ** 2)
# Z = np.sin(R)
# fig = plt.figure()
# ax = Axes3D(fig)
# surf = ax.plot_surface(X, Y, Z, rstride=1, cstride=1, cmap=cm.coolwarm,
#                        linewidth=0, antialiased=False)
# ax.set_zlim(-1.01, 1.01)

# ax.zaxis.set_major_locator(LinearLocator(10))
# ax.zaxis.set_major_formatter(FormatStrFormatter('%.02f'))

# fig.colorbar(surf, shrink=0.5, aspect=5)
# plt.title('Original Code')
# plt.show()
