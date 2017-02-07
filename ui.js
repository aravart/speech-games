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

var sug = new SpeechBlocks.Suggestions();
sug.setSuggestions(["add"]);
SpeechGames.controller.addStateChangeListener(function(state) {
  switch (state) {
    case SpeechBlocks.WorkspaceStates.EMPTY:
      sug.setSuggestions(["add"]);
      break;
    case SpeechBlocks.WorkspaceStates.ALL_BLOCKS_CONNECTED:
      sug.setSuggestions(["add","change","delete","run"]);
      break;
    case SpeechBlocks.WorkspaceStates.BLOCKS_UNCONNECTED:
      sug.setSuggestions(["add","change","delete","run","put"]);
      break;
    default:
      console.log('Unknown state! Cannot update manual.');
  }

});

});
