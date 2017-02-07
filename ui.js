goog.require('goog.dom');
goog.require('SpeechBlocks.WorkspaceStates');
goog.require('SpeechGames');

$(document).ready(function() {

var title = goog.dom.$('levels')
for (var i = 0; i < SpeechGames.MAX_LEVEL; i++) {
  if(i == SpeechGames.LEVEL - 1) {
    var levelElement = goog.dom.createDom('span', {
      'class': 'level_number level_done', 
      'id': 'level' + (i + 1), 
      'href': '?level=' + (i + 1)}, 
      (i + 1).toString());    
  } else {
    var levelElement = goog.dom.createDom('a', {
      'class': (i == SpeechGames.MAX_LEVEL - 1) ? 'level_number' : 'level_dot',
      'id': 'level' + (i + 1), 
      'href': '?level=' + (i + 1)},
      (i == SpeechGames.MAX_LEVEL - 1) ? (i+1).toString() : '');
  }
  goog.dom.appendChild(title, levelElement);
  goog.dom.appendChild(title, goog.dom.createTextNode(" "));
}

var page = 0;
var textIndex = -1;
var manual = [
  [
    ["Adding blocks:"], // title
    ["Add a move block", "Add a turn block", "Add a repeat block"] // text
  ],
  [
    ["Putting blocks:"],
    ["Put block 1 before block 2", "Put block 1 after block 2"]
  ],
  [
    ["Changing blocks:"],
    ["Change the first field in block 1 to left", "Change the second field in block 2 to 1000"]
  ],
  [
    ["Running the program:"],
    ["Run the program"]
  ]
]

var displayManualPage = function(index) {
  if (index >= 0 && index < manual.length)
  {
    page = index;
  }
}

var advanceManualPage = function()
{
  displayManualPage((page + 1) % manual.length);
}

var updateManual = function() {
  textIndex = (textIndex + 1) % manual[page][1].length;
  $("#manual-title").text(manual[page][0][0]);
  $("#manual-text").text("\"" + manual[page][1][textIndex] + "\" ").fadeIn().delay(2000).fadeOut(200, updateManual);
}

updateManual();

SpeechGames.controller.addStateChangeListener(function(state) {
  switch (state) {
    case SpeechBlocks.WorkspaceStates.EMPTY:
      displayManualPage(0);
      break;
    case SpeechBlocks.WorkspaceStates.ALL_BLOCKS_CONNECTED:
      displayManualPage(2);
      break;
    case SpeechBlocks.WorkspaceStates.BLOCKS_UNCONNECTED:
      displayManualPage(1);
      break;
    default:
      console.log('Unknown state! Cannot update manual.');
  }

});

});
