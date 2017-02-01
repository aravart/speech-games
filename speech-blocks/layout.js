/**
 * @fileoverview Implementats callbacks for layout control.
 * @author aravart@cs.wisc.edu (Ara Vartanian)
 */
'use strict';

goog.provide('SpeechBlocks.Layout');

goog.require('SpeechBlocks.Translation');

/**
 * @constructor
 */
SpeechBlocks.Layout = function() {
};

SpeechBlocks.Layout.prototype.validateAdd = function(block) {

};

SpeechBlocks.Layout.prototype.validateDisconnect = function(block) {

};

SpeechBlocks.Layout.prototype.validateRemove = function(block) {

};

/**
 * Returns coordinates of some empty space in the workspace
 * @private
 */
SpeechBlocks.Layout.prototype.getNewPosition_ = function() {
    var blocks = SpeechGames.workspace.getAllBlocks();
    if (blocks.length == 0) {
        return new SpeechBlocks.Translation(10, 10);
    }
    var maxy = 0;
    for (var i = 0; i < blocks.length; i++) {
        maxy = Math.max(maxy, blocks[i].getRelativeToSurfaceXY().y + blocks[i].height);
    }
    // If you use less than 20, Blockly shifts it rightward a bit because there is a zone under the block where it'd be connected
    return new SpeechBlocks.Translation(10, maxy + 20);
}
