/**
 * @fileoverview Represents the "successor" connection point of a block.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.Successor');

goog.require('SpeechBlocks.Animator');
goog.require('SpeechBlocks.BlockUtils');
goog.require('goog.asserts');

/**
 * @param {string} predecessorBlockId The ID of the predecessor block.
 * @extends {SpeechBlocks.Where}
 * @constructor
 */
SpeechBlocks.Successor = function(predecessorBlockId) {
  /** @private @const */
  this.predecessorBlockId_ = predecessorBlockId;
};

/**
 * Connects the given block to the "next connection" of the predecessor block.
 * @override
 */
SpeechBlocks.Successor.prototype.place = function(blockId, workspace, opt_animator) {
   if (SpeechBlocks.BlockUtils.areBlocksInSuccession(
      blockId, this.predecessorBlockId_, workspace)) {
    throw 'Block ' + blockId + ' and block ' + this.predecessorBlockId_ + ' are connected!';
  }

  if (opt_animator) {
    this.placeWithAnimation_(
      blockId,
      workspace,
      goog.asserts.assertInstanceof(opt_animator, SpeechBlocks.Animator));
    return;
  }

  var predecessorNextConnection =
      SpeechBlocks.BlockUtils.getNextConnection(this.predecessorBlockId_, workspace);
  var successorPrevConnection =
      SpeechBlocks.BlockUtils.getPreviousConnection(blockId, workspace);
  predecessorNextConnection.connect(successorPrevConnection);
};

/**
 * Connects the given block to the "next connection" of the predecessor block,
 * but does so by animating the process.
 * @param {string} blockId The ID of the block to move.
 * @param {!Blockly.Workspace} workspace The current workspace.
 * @param {!SpeechBlocks.Animator} animator The animation manager.
 * @private
 */
SpeechBlocks.Successor.prototype.placeWithAnimation_ = function(blockId, workspace, animator) {
  var blockToMove = SpeechBlocks.BlockUtils.getBlock(blockId, workspace);
  var refBlock = SpeechBlocks.BlockUtils.getBlock(this.predecessorBlockId_, workspace);
  var refXY = refBlock.getRelativeToSurfaceXY();
  animator.animateRelativeTranslation(
      blockId,
      blockToMove.getRelativeToSurfaceXY(),
      new goog.math.Coordinate(refXY.x, refXY.y + refBlock.height),
      function() { blockToMove.unselect(); });
};
