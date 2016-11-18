goog.require('goog.dom');
goog.require('SpeechGames');

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
