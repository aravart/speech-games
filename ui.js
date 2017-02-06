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

var manualPageIndex = 0;
var textIndex = -1;

var manualTitles = ["Adding blocks:", "Putting blocks:", "Changing blocks:", "Running the program:"];
var manualPages = [
  ["Add a move block", "Add a turn block", "Add a repeat block"],
  ["Put block 1 before block 2", "Put block 1 after block 2"],
  ["Change the first  field in block 1 to left", "Change the second field in block 2 to 1000"],
  ["Run the program"]
]

var displayManualPage = function(index) {
  if (index >= 0 && index < manualPages.length)
  {
    manualPageIndex = index;
  }
}

var advanceManualPage = function()
{
  displayManualPage((manualPageIndex + 1) % manualPages.length);
}

var updateManual = function() {
  textIndex = (textIndex + 1) % manualPages[manualPageIndex].length;
  $("#manual-title").text(manualTitles[manualPageIndex]);
  $("#manual-text").text("\"" + manualPages[manualPageIndex][textIndex] + "\" ").fadeIn().delay(1000).fadeOut(200, updateManual);
}

updateManual();