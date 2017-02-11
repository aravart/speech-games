/**
 * @fileoverview Manager for command manual.
 * @author david.liang@wisc.edu (David Liang), pandori@wisc.edu (Sahib Pandori)
 */
goog.provide('SpeechGames.Suggestions');

goog.require('goog.structs.Map');

/** @constructor */
SpeechGames.Suggestions = function() {
  /** @public */
  this.page = 0;

  /** @public */
  this.textIndex = -1;

  /** @private {!goog.structs.Map<string, number>} */
  this.map_ = new goog.structs.Map();

  /** @private */
  this.suggestionList_ = [
    [
      ['add'], // key
      ['Add a block:'], // title
      ['Add a move block', 'Add a turn block', 'Add a repeat block'] // text
    ],
    [
      ['put'],
      ['Attach two blocks:'],
      ['Put block 2 after block 1', 'Put block 1 after block 2']
    ],
    [
      ['change'],
      ['Change a block:'],
      ['Change the first field in block 1 to left', 'Change the second field in block 2 to 1000']
    ],
    [
      ['delete'],
      ['Delete a block:'],
      ['Delete block 1']
    ],
    [
      ['run'],
      ['Run the program:'],
      ['Run the program']
    ]
  ];

  for (var i = 0; i < this.suggestionList_.length; i++)
  {
    this.map_.set(this.suggestionList_[i][0][0], i);
  }

  /** @private */
  this.suggestions_ = [];
}

/** 
 * @return {!Array<string>}
 * @public
 */
SpeechGames.Suggestions.prototype.getAllSuggestions = function() {
  return this.map_.getKeys();
}

/**
 * @return {!Array<string>}
 * @public
 */
SpeechGames.Suggestions.prototype.getSuggestions = function() {
  return this.suggestions_;
}

/**
 * @param {!Array<string>} suggestions
 * @public
 */
SpeechGames.Suggestions.prototype.setSuggestions = function(suggestions) {
  this.suggestions_ = [];
  var suggestionIndex = 0;
  for (var i = 0; i < suggestions.length; i++)
  {
    var page = this.map_.get(suggestions[i]);
    if (page === undefined)
    {
      continue;
    }
    else
    {
      this.suggestions_[suggestionIndex++] = this.suggestionList_[page];
    }

  }
  this.updateSuggestions();
}

/** @public */
SpeechGames.Suggestions.prototype.updateSuggestions = function() {
  var suggestionDiv = document.getElementById('suggestionDiv');
  $('#suggestionDiv').empty();
  for (var i = 0; i < this.suggestions_.length; i++)
  {
    var title = document.createElement('H3');
    title.append(document.createTextNode(this.suggestions_[i][1][0]));
    var text = document.createElement('SPAN');
    text.append(document.createTextNode('\"' + this.suggestions_[i][2][0] + '\"'));

    suggestionDiv.append(title);
    suggestionDiv.append(text);
  }
}
