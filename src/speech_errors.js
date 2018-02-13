/**
 * Created by Sahib Pandori on 3/28/2017.
 * @author dliang@cs.wisc.edu (David Liang), pandori@wisc.edu (Sahib Pandori)
 */

/**
 * Contains a list of words used in the speech commands
 */
SpeechGames.Speech.allowedWords = [
  'block',
  'connect',
  'get',
  'delete',
  'move',
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
SpeechGames.Speech.corrections = {
  'pattern': 'get a turn',
  'kinect': 'connect',
  'to': '2',
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
  'free': '3',
  'tube': '2',
  'walkthrough': 'block 3',
  'force': '4',
  'netflix': 'connect block',
  '1 under': '100',
  '2 under': '200',
  '3 under': '300',
  '4 under': '400',
  '5 under': '500',
  '6 under': '600',
  '7 under': '700',
  '8 under': '800',
  '9 under': '900',
  '1:20': '120',
  '1:44': '144',
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
  'tutuapp': 'to up',
  'moon': 'move',
  'ghetto': 'get a',
  'keratin': 'get a turn',
  'garrett on': 'get a turn',
  'torn': 'turn',
  'elite': 'delete',
  'better': 'get a',
  'guitar': 'get a',
  'tone': 'turn',
  'corn': 'turn',
  'the next': 'connect',
  'it': '8',
  'phone': 'turn',
  'connector': 'connect',
  'cinder': 'under',
  'wall': '1',
  'loc': 'block',
  'lock': 'block',
  'drop': 'block',
  '245': 'to 45',
  '2:45': 'to 45',
  '272': 'to 72',
  '290': 'to 90',
  'remove': 'get a move',
  'gotta': 'get a',
  'tree': '3',
  'and': 'in',
  'the town': 'to down',
  '1-2': '1 to',
  '2-2': '2 to',
  '3-2': '3 to',
  '4-2': '4 to',
  '5-2': '5 to',
  '6-2': '6 to',
  '7-2': '7 to',
  '8-2': '8 to',
  '9-2': '9 to',
  '3+1': 'delete block 1',
  '+': 'in',
  'can i': ''
};

/**
 * Return all possible corrections using only the allowed words (and numbers)
 * @param speech The speech command that isn't recognized
 * @return Array possible commands that were misrecognized as 'speech'
 */
SpeechGames.Speech.prototype.correct = function (speech) {
  // TODO (sahibgoa): Too much duplicate code in the 2 for loops below, fix it
  var possibleCommands = [];
  var words = speech.split(" ");
  // Stores the corrected command
  var command = '';
  // Stores whether all given words in the command are valid
  var invalid = false;

  // Convert each invalid word to a allowed word without searching for wrong pairs of words
  for (var i = 0; i < words.length; i++) {
    // Check for individual invalid words if pairs aren't found
    if (!SpeechGames.Speech.allowedWords.includes(words[i])) {
      if (words[i] in SpeechGames.Speech.corrections) {
        command += SpeechGames.Speech.corrections[words[i]] + ' ';
      } else {
        // Check if it's a number (that doesn't need to be corrected)
        if (!isNaN(words[i])) {
          // The second last word in change is supposed to be 'to' and is sometimes mistaken as '2'
          if (words[0] == 'change' && words[i] == '2' && i == words.length - 2) {
            command += 'to ';
          } else {
            command += words[i] + ' ';
          }
          continue;
        }
        invalid = true;
        break;
      }
    }
    // Add the word to the command as it's an allowed word
    else {
      // Check if the word we're correcting is '2' and it's not the second last word of a change command because
      // there's a special case for that inside the above for loop
      if (words[i] == 'to' && ((words[0] != 'change') || (words[0] == 'change' && i != words.length - 2))) {
        command += SpeechGames.Speech.corrections[words[i]] + ' ';
      } else {
        command += words[i] + ' ';
      }
    }
  }

  // If all words in the command were valid, then add it as a possible corrected command
  if (!invalid) {
    possibleCommands.push(command.trim());
  }

  invalid = false;
  command = '';

  // Search for any pairs of invalid words and replace them with valid ones (if not search for invalid individual words)
  for (i = 0; i < words.length; i++) {
    // Check for a pair of invalid words
    if ((i != words.length - 1) && (words[i] + ' ' + words[i + 1]) in SpeechGames.Speech.corrections) {
      command += SpeechGames.Speech.corrections[words[i] + ' ' + words[i + 1]] + ' ';
      i++;
    }
    // Check for individual invalid words if pairs aren't found
    else if (!SpeechGames.Speech.allowedWords.includes(words[i])) {
      if (words[i] in SpeechGames.Speech.corrections) {
        command += SpeechGames.Speech.corrections[words[i]] + ' ';
      } else {
        // Check if it's a number (that doesn't need to be corrected)
        if (!isNaN(words[i])) {
          // The second last word in change is supposed to be 'to' and is sometimes mistaken as '2'
          if (words[0] == 'change' && words[i] == '2' && i == words.length - 2) {
            command += 'to ';
          } else {
            command += words[i] + ' ';
          }
        }
        invalid = true;
        break;
      }
    }
    // Add the word to the command as it's an allowed word
    else {
      // Check if the word we're correcting is '2' and it's not the second last word of a change command because
      // there's a special case for that inside the above for loop
      if (words[i] == 'to' && ((words[0] != 'change') || (words[0] == 'change' && i != words.length - 2))) {
        command += SpeechGames.Speech.corrections[words[i]] + ' ';
      } else {
        command += words[i] + ' ';
      }
    }
  }

  // If all words in the command are valid and it's not the same as the previous value (if there is one), then add
  // it as a possible corrected command
  if (!invalid) {
    if ((possibleCommands.length > 0 && command != possibleCommands[0]) || possibleCommands.length == 0) {
      possibleCommands.push(command.trim());
    }
  }

  return possibleCommands;
}

SpeechGames.Speech.prototype.pushCorrection = function (recognized, intended) {
  firebase.database().ref('/corrections/' + intended).transaction(function (corrections) {
    if (corrections === null) {
      return [recognized];
    } else {
      if (corrections.indexOf(recognized) == -1) {
        corrections.push(recognized);
      }
      return corrections;
    }
  });
}

SpeechGames.Speech.prototype.read = function (callback, keyword) {
  if (!callback) {
    return;
  }

  var path = '/corrections/';

  if (keyword) {
    path += keyword + '/'
  }

  firebase.database().ref(path).once('value').then(function (snapshot) {
    snapshot = snapshot.val();
    callback(snapshot);
  });
}

SpeechGames.Speech.prototype.proposeCorrections = function (misrecognized, intended) {
  if (intended.length <= 0) {
    return;
  }

  console.log("Proposed corrections for " + intended + ": " + misrecognized);
  var arr = {};
  arr[intended] = misrecognized;
  firebase.database().ref('/proposed/').push().set(arr);
}

// pushes everything under '/proposed/' to '/corrections/' in the database
SpeechGames.Speech.prototype.pushAllProposedCorrections = function () {
  firebase.database().ref('/proposed/').once('value').then(function (snapshot) {
    snapshot = snapshot.val();
    for (var key in snapshot) {
      for (var key2 in snapshot[key]) {
        for (var key3 in snapshot[key][key2]) {
          this.pushCorrection(snapshot[key][key2][key3], key2)
        }
      }
    }
  });
  firebase.database().ref('/proposed/').remove();
  console.log("Proposed corrections have been pushed.");
}

// reads corrections from firebase and puts them in "corrections"
SpeechGames.Speech.prototype.loadCorrections = function () {
  this.read(function (snapshot) {
    SpeechGames.Speech.corrections = {};
    for (var key in snapshot) {
      SpeechGames.Speech.corrections[snapshot[key]] = key;
    }
  });
  console.log("Corrections loaded from firebase.");
}

// used to recreate the database, if wiping it
SpeechGames.Speech.prototype.generate = function () {
  for (var key in SpeechGames.Speech.corrections) {
    this.addCorrection(key, SpeechGames.Speech.corrections[key]);
  }
}