"""Test minimum edit distance corrections."""
import csv
import itertools
from nltk.corpus import cmudict
import numpy as np

# The magical arpabet.
ARPABET = cmudict.dict()

# Constants for generating command options.
BLOCK_IDS = [str(val) for val in range(1, 11)]
VALUE_SETS = [
    ['up', 'down'],
    ['left', 'right'],
    ['45', '72', '90', '120', '144'],
    ['2', '3', '4', '5'],
    ['red', 'orange', 'blue', 'green', 'yellow', 'purple', 'brown', 'black', 'white']]
BLOCK_TYPES = ['move', 'turn', 'pen', 'color', 'repeat']

# Various corrections that are necessary to obtain a phonetic
# representation from arpabet.
SYM_MAP = {
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five',
    '6': 'six',
    '7': 'seven',
    '8': 'eight',
    '9': 'nine',
    '10': 'ten',
    '24': 'twenty four',
    '45': 'forty five',
    '52': 'fifty two',
    '72': 'seventy two',
    '90': 'ninety',
    '95': 'ninety five',
    '100': 'one hundred',
    '120': 'one twenty',
    '124': 'one twenty four',
    '125': 'one twenty five',
    '144': 'one forty four',
    '245': 'two forty five',
    '290': 'two ninety',
    '300': 'three hundred',
    '360': 'three sixty',
    '400': 'four hundred',
    '500': 'five hundred',
    '700': 'seven hundred',
    '9400': 'ninety four hundred',
    '+': 'plus',
    'k\'nex': 'connects',
    '6-2': 'six two',
    '1:20': 'one twenty',
    '1:44': 'one forty four',
    'lakhs': 'locks',
    '1/2': 'one half',
    'xbox': 'box',
    'blog': 'bog',
    '$2': 'two',
    'walkthrough': 'walk through',
    'nextflix': 'net flicks',
    'hr': 'her',
    '3-under': 'three under',
    '5-under': 'five under',
    'loc': 'lock',
    'kinect': 'connect',
    'tutuapp': 'two to',
    'connectbot': 'connect pot',
    'block1': 'block one',
    'pokemon': 'poke man',
    'farquad': 'far quad',
    '24125': 'twenty four one twenty five',
    'miquelon': 'nickel on',
    'pop3': 'pop three'
}

def gen_get(block_types):
    """Generate all GET commands.

    Args:
        block_types: List of all possible block types.

    Returns:
        List of all valid GET commands.
    """
    get = lambda btype: 'get a ' + btype + ' block'
    return [get(btype) for btype in block_types]

def gen_move(block_ids):
    """Generate all MOVE commands.

    Args:
        block_ids: List of all block IDs that are (hypothetically) in the workspace.

    Returns:
        List of all valid MOVE commands.
    """
    # Useful lambdas.
    connect_under = lambda bid1, bid2: 'connect block ' + bid1 + ' under block ' + bid2
    connect_inside = lambda bid1, bid2: 'connect block ' + bid1 + ' inside block ' + bid2

    # Do the generating.
    coms = []
    for (bid1, bid2) in itertools.combinations(block_ids, 2):
        coms.append(connect_under(bid1, bid2))
        coms.append(connect_under(bid2, bid1))
        coms.append(connect_inside(bid1, bid2))
        coms.append(connect_inside(bid2, bid1))
    return coms

def gen_change(block_ids, value_sets):
    """Generate all CHANGE commands.

    Args:
        block_ids: List of all block IDs that are (hypothetically) in the workspace.
        value_sets: List of all value sets for fields.

    Returns:
        List of all valid CHANGE commands.
    """
    change = lambda bid, oldv, newv: 'change ' + oldv + ' in block ' + bid + ' to ' + newv
    coms = []
    for bid in block_ids:
        for value_set in value_sets:
            for (vl1, vl2) in itertools.combinations(value_set, 2):
                coms.append(change(bid, vl1, vl2))
                coms.append(change(bid, vl2, vl1))
    return coms

def gen_delete(block_ids):
    """Generate all DELETE commands.

    Args:
        block_ids: List of all block IDs that are (hypothetically) in the workspace.

    Returns:
        List of all valid DELETE commands.
    """
    delete = lambda bid: 'delete block ' + bid
    return [delete(bid) for bid in block_ids]

def gen_commands(block_ids, block_types, value_sets):
    """Generate all possible commands (loosely speaking) given the list of
    block IDs, block types, and field values.

    Args:
        block_ids: List of all block IDs that are (hypothetically) in the workspace.
        block_types: List of all valid block types.
        value_sets: List of all field value sets.

    Returns:
        The complete list of valid commands. (Size is quadratic in number of block IDs.)
    """
    coms = []
    coms.extend(gen_get(block_types))
    coms.extend(gen_move(block_ids))
    coms.extend(gen_change(block_ids, value_sets))
    coms.extend(gen_delete(block_ids))
    coms.append('go to the next level')
    coms.append('stay on this level')
    coms.append('run the program')
    return coms

def phon_seq(phrase):
    """Converts the phrase to a phoneme sequence, replacing unknown words
    and symbols if necessary.

    Args:
        phrase: The phrase to convert.

    Returns:
        A list of phonemes, extracted from arphabet.
    """
    words = phrase.split()
    seq = []
    for word in words:
        if word in SYM_MAP.keys():
            for subword in SYM_MAP[word].split():
                seq.extend(ARPABET[subword][0])
        else:
            seq.extend(ARPABET[word][0])
    return seq

def levenshtein_table(rec, com):
    rseq = phon_seq(rec)
    cseq = phon_seq(com)
    dists = np.zeros((len(rseq), len(cseq)))
    for (i, rphon) in enumerate(rseq):
        for (j, cphon) in enumerate(cseq):
            if j == 0:
                dists[i, j] = i
            elif i == 0:
                dists[i, j] = j
            else:
                dists[i, j] = min(
                    dists[i-1, j] + 1,
                    dists[i, j-1] + 1,
                    dists[i-1, j-1] + (1 if rphon != cphon else 0))
    return dists

def levenshtein(rec, com):
    """Computes the Levenshtein (edit) distance between the recognition and command.

    Args:
        rec: The recognition.
        com: The command.

    Returns:
        The edit distance between the recognition and command (an integer).
    """
    return levenshtein_table(rec, com)[-1, -1]

def correct(rec, coms):
    """Given the command set, corrects the recognition.

    Args:
        rec: The recognition to correct.
        coms: The set of valid correct candidates.

    Returns:
        The closest correct in edit distance.
    """
    dists = {com:levenshtein(rec, com) for com in coms}
    return min(dists.keys(), key=dists.get)

def load_data(filename):
    """Loads the correction data from the CSV file. File must at least have two
    columns, namely a 'Recognition' column and an 'Utterance' column.

    Args:
        filename: Name of the csv file from which to load the data.

    Returns:
        List of dicts representing recognitions and the corresponding intended command.
    """
    data = []
    with open(filename) as csvfile:
        for row in csv.DictReader(csvfile):
            data.append({
                'rec':row['Recognition'].lower(),
                'com':row['Utterance'].lower()
            })
    return data

def print_example(ex):
    """Pretty prints the example after it has been corrected."""
    if ex['rec'] == ex['com']:
        color = '\033[93m'
        clarifier = 'UNCHANGED:'
    elif ex['cor'] == ex['com']:
        color = '\033[92m'
        clarifier = 'CORRECTLY CHANGED:'
    else:
        color = '\033[91m'
        clarifier = 'INCORRECTLY CHANGED:'
    print color, clarifier, '\033[0m', '"', ex['rec'], '" ----> "', ex['cor'], '"'
    print '\t\t(should be "', ex['com'], '")'

def main():
    """Tests the edit-distance method of speech correction."""
    data = []
    data.extend(load_data('no_corrections_data.csv'))
    data.extend(load_data('hash_corrections_data.csv'))
    commands = gen_commands(BLOCK_IDS, BLOCK_TYPES, VALUE_SETS)

    num_corrections = 0
    original_correct = 0
    new_correct = 0
    for ex in data:
        # Uncomment the lines below to determine which words are not properly
        # accounted for in the symbol map defined at the top of this file.
        # for word in ex['rec'].split():
        #     if not word.lower() in ARPABET.keys() and not word.lower() in SYM_MAP.keys():
        #         print word
        ex['cor'] = correct(ex['rec'], commands)
        print_example(ex)
        num_corrections += 1 if ex['cor'] != ex['rec'] else 0
        original_correct += 1 if ex['rec'] == ex['com'] else 0
        new_correct += 1 if ex['cor'] == ex['com'] else 0
    print 'Final accuracy was', float(new_correct) / len(data)
    print 'Original accuracy was', float(original_correct) / len(data)
    print num_corrections, 'corrections were made.'

    print 'Writing the results to file...'
    with open('levenshtein_corrections.csv', 'w') as csv_out:
        corr_writer = csv.writer(csv_out)
        corr_writer.writerow(['utterance', 'recognition', 'correction'])
        for ex in data:
            corr_writer.writerow([ex['com'], ex['rec'], ex['cor']])

if __name__ == '__main__':
    main()
