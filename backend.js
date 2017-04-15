var database = firebase.database();

function proposeCorrection(recognized, intended) {
  database.ref('/proposed/' + intended).transaction(function (corrections) {
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

function addCorrection(recognized, intended) {
  database.ref('/corrections/' + intended).transaction(function (corrections) {
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

function read(callback, keyword) {
  if (!callback) {
    return;
  }

  if (keyword) {
    database.ref('/corrections/' + keyword).once('value').then(function (snapshot) {
      snapshot = snapshot.val();
      callback(snapshot);
    });
  } else {
    database.ref('/corrections/').once('value').then(function (snapshot) {
      snapshot = snapshot.val();
      callback(snapshot);
    });
  }
}

// reads corrections from firebase and puts them in "corrections"
function load() {
  read(function (snapshot) {
    corrections = {};
    for (var key in snapshot) {
      corrections[snapshot[key]] = key;
    }
  })
}

// used to recreate the database, if wiping it
function generate() {
  var corrections = {
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
  for (var key in corrections) {
    addCorrection(key, corrections[key]);
  }
}