/**
 * Created by Sahib Pandori on 3/28/2017.
 */

/**
 * Contains a list of words used in the speech commands
 */
var allowedWords = [
    'block',
    'connect',
    'get',
    'delete',
    'under',
    'right',
    'left',
    'pen',
    'turn',
    'change',
    'to',
    'up',
    'down',
    'run',
    'the',
    'program',
    'a',
    'repeat',
    'in',
    'inside'
];

/**
 * Contains common mistakes made by the speech recognizer and their actual (probably) values
 */
var corrections = {

    'pattern': 'get a turn',
    'kinect': 'connect',
    '2': 'to',
    'white': 'right',
    'write': 'right',
    'up and': 'a pen',
    'for': '4',
    'foreign': '4',
    'ford': '4',
    'war': '4',
    'lakhs': 'block',
    'a pin': 'up in',
    'hey': 'hey jerry',
    'greta': 'get a',
    'text': 'connect',
    'k\'nex': 'connect',
    'blog': 'block',
    'xbox': 'connect block',
    'jetta': 'get a',
    'return': 'get a turn',
    'today': 'get',
    'can you': 'get a',
    'sex': '6',
    'free': 'delete',
    'tube': '2',
    'walkthrough': 'block 3',
    'force': '4',
    'netflix free': 'connect block 3',
    '100': '1 under',
    '200': '2 under',
    '300': '3 under',
    '400': '4 under',
    '500': '5 under',
    '600': '6 under',
    '700': '7 under',
    '800': '8 under',
    '900': '9 under',
    'black tooth': 'block 2',
    'clock': 'block',
    'on': 'block',
    'tattoo pattern': 'get a turn',
    'lot': 'block',
    'blockhead': 'block 8',
    'laugh': 'left',
    'price': '5',
    'glock': 'block',
    'got': 'get',
    'death': 'get',
    'ken': 'pen',
    'tutuapp': 'to up'
};

/**
 * Return all possible corrections using only the allowed words (and numbers)
 * @param speech The speech command that isn't recognized
 */
function correct(speech) {

    var possibleCommands = [];
    var words = speech.split(" ");
    for (word in words) {
        if (!(word in allowedWords)) {
            // TODO (sahibgoa): Get all possible corrections and return those
        }
    }

}