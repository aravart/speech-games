/**
 * @fileoverview Implements callbacks for layout control.
 * @author aravart@cs.wisc.edu (Ara Vartanian)
 */
'use strict';

goog.provide('SpeechBlocks.Layout');

goog.require('SpeechBlocks.Translation');

/**
 * @param {!Blockly.Workspace} workspace
 * @constructor
 */
SpeechBlocks.Layout = function(workspace) {
  this.workspace_ = workspace;
};

SpeechBlocks.Layout.prototype.validateAdd = function(block) {

};

SpeechBlocks.Layout.prototype.validateDisconnect = function(block) {

};

SpeechBlocks.Layout.prototype.validateRemove = function(block) {

};

/**
 * Returns coordinates of some empty space in the workspace
 * @return {!SpeechBlocks.Translation} Translation for moving block to new position.
 * @private
 */
SpeechBlocks.Layout.prototype.getNewPosition_ = function() {
    var blocks = this.workspace_.getAllBlocks();
    if (blocks.length == 0) {
        return new SpeechBlocks.Translation(10, 10);
    }
    var maxy = 0;
    for (var i = 0; i < blocks.length; i++) {
        maxy = Math.max(maxy, blocks[i].getRelativeToSurfaceXY().y + blocks[i].height);
    }
    // If you use less than 20, Blockly shifts it rightward a bit
    // because there is a zone under the block where it'd be connected.
    return new SpeechBlocks.Translation(10, maxy + 20);
}
