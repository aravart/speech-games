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
      ['get'], // key
      ['Getting a block:'], // title
      ['Get a <span style=font-weight:bold>move</span> block'] //text
    ],
    [
      ['connect_under'],
      ['Connect blocks:'],
      ['Connect block <span style=font-weight:bold>2</span> under block ' + 
          '<span style=font-weight:bold>1</span>']
    ],
    [
      ['connect_inside'],
      ['nest blocks:'],
      ['Connect block <span style=font-weight:bold>2</span> inside block ' + 
          '<span style=font-weight:bold>1</span>']
    ],
    [
      ['change'],
      ['Changing a block:'],
      ['Change <span style=font-weight:bold>4</span> in ' + 
          'block <span style=font-weight:bold>1</span> to ' + 
          '<span style=font-weight:bold>5</span>']
    ],
    [
      ['delete'],
      ['Deleting a block:'],
      ['Delete block <span style=font-weight:bold>1</span>']
    ],
    [
      ['run'],
      ['Running the program:'],
      ['Run the program']
    ]
  ];

  for (var i = 0; i < this.suggestionList_.length; i++) {
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
  for (var i = 0; i < suggestions.length; i++) {
    var page = this.map_.get(suggestions[i]);
    if (page === undefined) {
      continue;
    } else {
      this.suggestions_[suggestionIndex++] = this.suggestionList_[page];
    }
  }
  this.updateSuggestions();
}

/** @public */
SpeechGames.Suggestions.prototype.updateSuggestions = async function updateSuggestions() {
  this.stopBlinkingSuggestions();
  var suggestionDiv = $('#suggestionDiv');
  for (var i = this.suggestions_.length - 1; i >= 0; i--) {
    $('#suggestionTitle' + i).fadeOut(500);
    $('#suggestionText' + i).fadeOut(500);
    await sleep(100);
    $('#suggestionTitle' + i).empty();
    $('#suggestionText' + i).empty();
  }
  $('#suggestionDiv').empty();
  for (var i = 0; i < this.suggestions_.length; i++) {
    // var title = '<h3 id=\'suggestionTitle' + i + '\'>' 
    //   + this.suggestions_[i][1][0] + '</h3>';
    // var text = '<span id=\'suggestionText' + i + '\'>\"' 
    //   + this.suggestions_[i][2][0] + '\"</span>';
    var text = '<h4 id=\'suggestionText' + i + '\'>\"' 
      + this.suggestions_[i][2][0] + '\"</h4>';
    // $(title).hide().appendTo(suggestionDiv).delay(i*100).fadeIn(500);
    $(text).hide().appendTo(suggestionDiv).delay(i*100).fadeIn(500);
  }
  setTimeout(function() {
    this.interval = setInterval(this.blinkSuggestions, 2000); 
  }.bind(this), 10000)
}

/** @public */
SpeechGames.Suggestions.prototype.blinkSuggestion = function(key, n) {
  if (this.suggestions_) {
    for (var i = 0; i < this.suggestions_.length; i++) {
      if (this.suggestions_[i][0][0] === key) {
        for (var j = 0; j < n; j++) {
          $('#suggestionText' + i).fadeOut(1000).fadeIn(1000);
        }
        return;
      }
    }
  }
}

/** @public */
SpeechGames.Suggestions.prototype.blinkSuggestions = function() {
  $('#suggestionContainer').toggleClass('active');
}

/** @public */
SpeechGames.Suggestions.prototype.stopBlinkingSuggestions = function() {
  clearInterval(this.interval);
  $('#suggestionContainer').removeClass('active')
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
