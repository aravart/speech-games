/**
 * @fileoverview Implements callbacks for layout control.
 * @author aravart@cs.wisc.edu (Ara Vartanian), ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.Layout');

goog.require('SpeechBlocks.Translation');
goog.require('goog.math.Coordinate');

/**
 * The minimum x margin for any block.
 * 
 * @private @const {number}
 */
var X_MARGIN_ = 20;

/**
 * The minimum y margin for any block.
 * 
 * @private @const {number}
 */
var Y_MARGIN_ = 10;

/**
 * The minimum xy margin between two blocks.
 * 
 * @private @const {number}
 */
var BLOCK_MARGIN_ = 25;

/**
 * @param {!Blockly.Workspace} workspace The current workspace.
 * @constructor
 */
SpeechBlocks.Layout = function(workspace) {
  this.workspace_ = workspace;
};

/**
 * Returns the coordinates of a free position on the workspace.
 * 
 * TODO: This function should consider look for space in the x direction
 * as well, once we figure out a more sophisticated layout algorithm.
 * 
 * @return {!goog.math.Coordinate} The XY coordinates at which the new
 *      block should be placed, relative to the top left corner
 *      of the workspace.
 * @public
 */
SpeechBlocks.Layout.prototype.getPositionForNewBlock = function() {
  var blocks = this.workspace_.getAllBlocks();
  if (!blocks.length) {
    return new goog.math.Coordinate(X_MARGIN_, Y_MARGIN_);
  }
  
  var maxy = 0;
  for (var i = 0; i < blocks.length; i++) {
    maxy = Math.max(maxy, blocks[i].getRelativeToSurfaceXY().y + blocks[i].height);
  }
  return new goog.math.Coordinate(X_MARGIN_, BLOCK_MARGIN_ + maxy);
};
