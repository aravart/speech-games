/**
 * @fileoverview Represents the "predecessor" connection point of a block.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.Predecessor');

goog.require('SpeechBlocks.Animator');
goog.require('SpeechBlocks.BlockUtils');
goog.require('goog.asserts')

/**
 * @param {string} successorBlockId The ID of the successor block. 
 * @extends {SpeechBlocks.Where}
 * @constructor
 */
SpeechBlocks.Predecessor = function(successorBlockId) {
  /** @private @const */
  this.successorBlockId_ = successorBlockId;
};

/**
 * Connects the given block to the "previous connection" of the successor block.
 * @override
 */
SpeechBlocks.Predecessor.prototype.place = function(blockId, workspace, opt_animator) {
  if (SpeechBlocks.BlockUtils.areBlocksInSuccession(
      blockId, this.successorBlockId_, workspace)) {
    throw 'Block ' + blockId + ' and block ' + this.successorBlockId_ + ' are connected!';
  }

  if (opt_animator) {
    this.placeWithAnimation_(
      blockId,
      workspace,
      goog.asserts.assertInstanceof(opt_animator, SpeechBlocks.Animator));
    return;
  }

  var successorPrevConnection =
      SpeechBlocks.BlockUtils.getPreviousConnection(this.successorBlockId_, workspace);
  if (successorPrevConnection.isConnected()) {
    var chainPrevConnection =
        SpeechBlocks.BlockUtils.getPreviousConnection(blockId, workspace);
    successorPrevConnection.targetConnection.connect(chainPrevConnection);
  }
  var chainNextConnection =
      SpeechBlocks.BlockUtils.getChainNextConnection(blockId, workspace);
  successorPrevConnection.connect(chainNextConnection); 
}

/**
 * Connects the given block to the "previous connection" of the successor block,
 * but does so by animating the process.
 * @param {string} blockId The ID of the block to move.
 * @param {!Blockly.Workspace} workspace The current workspace.
 * @param {!SpeechBlocks.Animator} animator The animation manager.
 * @private
 */
SpeechBlocks.Predecessor.prototype.placeWithAnimation_ = function(blockId, workspace, animator) {
  var blockToMove = SpeechBlocks.BlockUtils.getBlock(blockId, workspace);
  var refBlock = SpeechBlocks.BlockUtils.getBlock(this.successorBlockId_, workspace);
  
  var blockToMoveXY = blockToMove.getRelativeToSurfaceXY();
  blockToMoveXY.y += blockToMove.getHeightWidth().height;

  animator.animateRelativeTranslation(
      blockId, blockToMoveXY, refBlock.getRelativeToSurfaceXY());
};
