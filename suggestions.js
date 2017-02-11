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
            ["add"], // key
            ["Adding a block:"], // title
            ["Add a <span style=font-weight:bold>move</span> block"] //text
        ],
        [
            ["put"],
            ["Connecting blocks:"],
            ["Put block <span style=font-weight:bold>2</span> after block <span style=font-weight:bold>1</span>"]
        ],
        [
            ["change"],
            ["Changing a block:"],
            ["Change the <span style=font-weight:bold>first</span> field in block <span style=font-weight:bold>1</span> to <span style=font-weight:bold>left</span>"]
        ],
        [
            ["delete"],
            ["Deleting a block:"],
            ["Delete block <span style=font-weight:bold>1</span>"]
        ],
        [
            ["run"],
            ["Running the program:"],
            ["Run the program"]
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
SpeechGames.Suggestions.prototype.updateSuggestions = function() {
    var suggestionDiv = document.getElementById("suggestionDiv");
    $("#suggestionDiv").empty();
    for (var i = 0; i < this.suggestions_.length; i++) {
        var title = "<h3>" + this.suggestions_[i][1][0] + "</h3>";
        var text = "<span>\"" + this.suggestions_[i][2][0] + "\"</span>";
        $(title).hide().appendTo("#suggestionDiv").delay(i*100).fadeIn(500);
        $(text).hide().appendTo("#suggestionDiv").delay(i*100).fadeIn(500);
    }
}
