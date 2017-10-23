import matplotlib.pyplot as plt


def num_lines_in_file(filename):
    """
    Count number of lines in a file
    :param filename: name of the file
    :return: number of lines
    """
    i = 0
    with open(filename, 'r') as file:
        for _ in file:
            i += 1
    return i


def read_threshold_csv(filename):
    """
    Read the threshold and accuracy data
    :param filename: the data file name
    :return: a list of thresholds and corresponding accuracies
    """
    threshold = []
    accuracy = []
    with open(filename, 'r') as file:
        for line in file:
            t, a = line.split(',')
            threshold.append(round(float(t), 2))
            accuracy.append(round(float(a), 2))
    return threshold, accuracy


def plot_graph(x, y, title, filename, xlabel='Threshold', ylabel='Accuracy', mark_highest=False):
    """
    Wrapper to call the matplotlib.pyplot methods for plotting and saving a graph
    :param x: x values
    :param y: y values
    :param title: title of the plot
    :param filename: the filename the plot should be saved as
    :param xlabel: label for the x-axis
    :param ylabel: label for the y-axis
    :param mark_highest: whether the highest (on y-axis) point should be highlighted
    """
    plt.plot(x, y)
    plt.title(title)
    plt.xlabel(xlabel + '-->')
    plt.ylabel(ylabel + '-->')
    if mark_highest:
        max_idx = y.index(max(y))
        plt.axvline(x=x[max_idx], linewidth=0.5, color='red', linestyle='dashed')
        plt.axhline(y=y[max_idx], linewidth=0.5, color='red', linestyle='dashed')
        plt.annotate('({x}, {y})'.format(x=x[max_idx], y=round(y[max_idx], 2)), xy=(x[max_idx], y[max_idx]))
    plt.grid(linestyle='-')
    plt.savefig('graphs/' + filename + '.png', dpi=150)
    plt.close()
