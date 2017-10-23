import util

# Contain data collected by running JS analysis code in src/arpabet/edit_threshold_analysis.js
CORRECT_UTTERANCES_FILE_PATH = 'threshold-analysis-data/correct_utterances_threshold.csv'
INCORRECT_UTTERANCES_FILE_PATH = 'threshold-analysis-data/incorrect_utterances_threshold.csv'

# Count the total number of positive (correct) and negative (incorrect) examples present
TOTAL_CORRECT = util.num_lines_in_file('threshold-analysis-data/correct-utterances.csv')
TOTAL_INCORRECT = util.num_lines_in_file('threshold-analysis-data/incorrect-utterances.csv')


def plot_utterances_threshold(type):
    """
    Plots the accuracy of correct/incorrect utterances vs. threshold
    """
    file = CORRECT_UTTERANCES_FILE_PATH if type == 'correct' else INCORRECT_UTTERANCES_FILE_PATH
    threshold, accuracy = util.read_threshold_csv(file)
    util.plot_graph(x=threshold,
                    y=accuracy,
                    title='Threshold vs. Accuracy on {type} utterances'.format(type=type),
                    filename='{type}_threshold_accuracy'.format(type=type))


def plot_overall_utterances_threshold(equal_weight=False):
    """
    Plots the overall accuracy vs. thresholds while weighing correct/incorrect examples differently
    :param equal_weight: True if both correct and incorrect examples should be weighed equally 
                         irrespective of quantity, False otherwise
    """
    c_threshold, c_accuracy = util.read_threshold_csv(CORRECT_UTTERANCES_FILE_PATH)
    ic_threshold, ic_accuracy = util.read_threshold_csv(INCORRECT_UTTERANCES_FILE_PATH)

    def cat_weight_func(x, y):
        return (x + y) / 2

    def ex_weight_func(x, y):
        return (TOTAL_CORRECT * x + TOTAL_INCORRECT * y) / (TOTAL_CORRECT + TOTAL_INCORRECT)

    overall_accuracy = [
        cat_weight_func(c, ic) if equal_weight else ex_weight_func(c, ic)
        for c, ic in zip(c_accuracy, ic_accuracy)
    ]

    suffix = 'Weighted By ' + ('Category' if equal_weight else 'Example')
    file_suffix = '_' + ('cat' if equal_weight else 'ex') + '_weight'
    util.plot_graph(x=c_threshold,
                    y=overall_accuracy,
                    title='Threshold vs. Overall Accuracy (' + suffix + ')',
                    filename='overall_threshold_accuracy' + file_suffix,
                    mark_highest=True)


plot_utterances_threshold(type='correct')
plot_utterances_threshold(type='incorrect')
plot_overall_utterances_threshold(equal_weight=True)
plot_overall_utterances_threshold(equal_weight=False)
