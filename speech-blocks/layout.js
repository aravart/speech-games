/**
 * @fileoverview Implements callbacks for layout control.
 * @author aravart@cs.wisc.edu (Ara Vartanian), ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.Layout');

goog.require('Blockly.Block');
goog.require('Blockly.Workspace');
goog.require('SpeechBlocks.BlockUtils');
goog.require('SpeechBlocks.Translation');
goog.require('goog.math.Coordinate');
goog.require('goog.structs.Set');

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
  /** @type {!Blockly.Workspace} */
  this.workspace_ = workspace;
};

/**
 * Returns an array of all blocks that visually overlap with the given block
 * or any block in its chain.
 * @param {string} blockId The ID of the block in the chain whose overlapping
 *      neighbors should be returned.
 * @return {!goog.structs.Set<!Blockly.Block>} The overlapping blocks. 
 * @public
 */
SpeechBlocks.Layout.prototype.getBlocksThatOverlapChain = function(blockId) {
  /** @type {!goog.structs.Set<!Blockly.Block>} */
  var overlappingBlocks = new goog.structs.Set();
  SpeechBlocks.BlockUtils.getBlocksInChain(blockId, this.workspace_).forEach(
    function(block) {
      overlappingBlocks.addAll(this.getBlocksThatOverlapBlock_(block.id));
    }.bind(this));
  return overlappingBlocks;
};

/**
 * Returns an array of all blocks that visually overlap with just the given block.
 * @param {string} blockId The ID of the block whose overlapping neighbors
 *    should be returned.
 * @return {!Array<!Blockly.Block>} The overlapping blocks.
 * @private
 */
SpeechBlocks.Layout.prototype.getBlocksThatOverlapBlock_ = function(blockId) {
  var theBlock = SpeechBlocks.BlockUtils.getBlock(blockId, this.workspace_);
  var overlappingBlocks = [];
  var blocks = this.workspace_.getAllBlocks();
  for (var i = 0; i < blocks.length; i++) {
    if (SpeechBlocks.BlockUtils.areBlocksConnected(
        blockId, blocks[i].id, this.workspace_)) {
      continue;
    }
    var doBlocksOverlap = SpeechBlocks.Layout.boxesOverlap_(
        theBlock.getRelativeToSurfaceXY(),
        {height:theBlock.height, width:theBlock.width},
        blocks[i].getRelativeToSurfaceXY(),
        {height:blocks[i].height, width:blocks[i].width});
    if (doBlocksOverlap) {
      overlappingBlocks.push(blocks[i]);
    }
  }
  return overlappingBlocks;
};

/**
 * Returns the coordinates of a free position on the workspace.
 * 
 * TODO(ehernandez4): Find a way to retrofit getPositionForExistingBlock
 * to this purpose as well, since the same algorithm should work for new blocks.
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

/**
 * Finds the coordinates of an open area on the workspace.
 * 
 * If there are no reasonably sized positions on the workspace, the function
 * defaults to the top left corner of the workspace.
 * 
 * @param {string} blockId The ID of the block to reposition.
 * @return {!goog.math.Coordinate} The new coordinates of the new position.
 * @public 
 */
SpeechBlocks.Layout.prototype.getPositionForExistingBlock = function(blockId) {
  var block = SpeechBlocks.BlockUtils.getBlock(blockId, this.workspace_);
  
  // TODO(ehernandez4): It looks like this does not consider scaling. We need a more
  // reliable way to get height/width of workspace.
  var workspaceMetrics = this.workspace_.getMetrics();
  
  // Look for open boxes on the workspace that have the same size as the block's (chain).
  // Do this by iterating through candidate starting points, each 20 pixels apart in the y,
  // and then then the x, direction.
  for (var x = X_MARGIN_; x < workspaceMetrics.viewWidth; x += BLOCK_MARGIN_) {
    for (var y = Y_MARGIN_; y < workspaceMetrics.viewHeight; y += BLOCK_MARGIN_) {
      var coords = new goog.math.Coordinate(x, y);
      if (this.isBoxFree_(coords, block.getHeightWidth(), blockId)) {
        return coords;
      }
    }
  }
  return new goog.math.Coordinate(X_MARGIN_, Y_MARGIN_);
};

/**
 * Returns true if the box starting at (x, y) with size (height, width)
 * contains no other blocks.
 * 
 * Accepts a block ID to exclude from the search. This is useful,
 * for example, when we don't want to consider a block's current position as
 * occupied space.
 * 
 * @param {!goog.math.Coordinate} boxXY The top left corner of the box.
 * @param {!{height: number, width: number}} The dimensions of the box.
 * @param {string} excludeBlockId Do not count the block with this ID,
 *      or any blocks in the same chain, as occupying the box's space.
 * @return {boolean} True if the box is free, false otherwise.
 * @private
 */
SpeechBlocks.Layout.prototype.isBoxFree_ = function(boxXY, boxHeightWidth, excludeBlockId) {
  var blocks = this.workspace_.getAllBlocks();
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (blocks[i].id == excludeBlockId
        || SpeechBlocks.BlockUtils.areBlocksConnected(
            blocks[i].id, excludeBlockId, this.workspace_)) {
      continue;
    } else if (
        SpeechBlocks.Layout.boxesOverlap_(
            boxXY,
            boxHeightWidth,
            blocks[i].getRelativeToSurfaceXY(),
            blocks[i].getHeightWidth())) {
      return false;
    }
  }
  return true;
};

/**
 * Returns true if the given boxes overlap.
 * @param {!goog.math.Coordinate} box1XY The top left corner of box 1.
 * @param {!{height: number, width: number}} box1HeightWidth The dimensions of box 1.
 * @param {!goog.math.Coordinate} box2XY The top left corner of box 2.
 * @param {!{height: number, width: number}} box2HeightWidth The dimensions of box 2.
 * @return {boolean} True if the boxes overlap, false otherwise.
 * @private
 */
SpeechBlocks.Layout.boxesOverlap_ = function(
    box1XY, box1HeightWidth, box2XY, box2HeightWidth) {
  var doesXCollide = SpeechBlocks.Layout.intervalsOverlap_(
      {start:box1XY.x, end:box1XY.x + box1HeightWidth.width},
      {start:box2XY.x, end:box2XY.x + box2HeightWidth.width});
  var doesYCollide = SpeechBlocks.Layout.intervalsOverlap_(
      {start:box1XY.y, end:box1XY.y + box1HeightWidth.height},
      {start:box2XY.y, end:box2XY.y + box2HeightWidth.height});
  return doesXCollide && doesYCollide;
};

/**
 * Returns true if the intervals A and B overlap.
 * @param {!{start: number, end: number}} ivlA The first interval.
 * @param {!{start: number, end: number}} ivlB The second interval.
 * @return {boolean} True if the intervals overlap, false otherwise.
 * @private
 */
SpeechBlocks.Layout.intervalsOverlap_ = function(ivlA, ivlB) {
  return ((ivlA.start <= ivlB.start && ivlB.start <= ivlA.end)
      || (ivlB.start <= ivlA.start && ivlA.start <= ivlB.end));
};
