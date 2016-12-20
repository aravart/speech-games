/**
 * @fileoverview Represents an absolute position on the workspace.
 * @author aravart@cs.wisc.edu (Ara Vartanian)
 */
'use strict';

goog.provide('SpeechBlocks.Position');

goog.require('SpeechBlocks.Blocks');

/**
 * @param {integer} x The coordinate of the block.
 * @param {integer} y The coordinate of the block.
 * @extends {SpeechBlocks.Where}
 * @constructor
 */
SpeechBlocks.Position = function(x,y) {
  /** @private @const */
  this.x_ = x;
  /** @private @const */
  this.y_ = y;
};

/**
 * Moves the block to an absolute position on the workspace
 * @override
 */
SpeechBlocks.Position.prototype.place = function(blockId, workspace) {
  var block = SpeechBlocks.Blocks.getBlock(blockId, workspace)
  block.moveBy(this.x_, this.y_);
};
