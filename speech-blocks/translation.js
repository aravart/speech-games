/** 
 * @fileoverview Represents an xy translation on the workspace
 * where a block can exist as a singleton.
 * @author ehernandez4@wisc.edu (Evan Hernandez)  
 */
'use strict'

goog.provide('SpeechBlocks.Translation');

goog.require('SpeechBlocks.Blocks');
goog.require('goog.math.Coordinate');

/**
 * @param {number} dx Change in x position.
 * @param {number} dy Change in y position.
 * @extends {SpeechBlocks.Where}
 * @constructor
 */
SpeechBlocks.Translation = function(dx, dy) { 
  /** @private @const */
  this.dx_ = dx;

  /** @private @const */
  this.dy_ = dy;
};

/**
 * Places the block with the given ID at the top-level position.
 * @override 
 */
SpeechBlocks.Translation.prototype.place = function(blockId, workspace) {
  SpeechBlocks.Blocks.getBlock(blockId, workspace).moveBy(this.dx_, this.dy_);
};
