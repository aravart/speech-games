/**
 * @fileoverview Represents the "successor" connection point of a block.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.Successor');

goog.require('SpeechBlocks.BlockUtils');

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
SpeechBlocks.Successor.prototype.place = function(blockId, workspace) {
  // If the successor block comes after the given block in the same chain,
  // the placement is invalid.
  if (SpeechBlocks.BlockUtils.areBlocksInSameChain(
      blockId, this.predecessorBlockId_, workspace)) {
    throw 'Block ' + blockId + ' and block ' + this.predecessorBlockId_ + ' are connected!';
  }
  var predecessorNextConnection =
      SpeechBlocks.BlockUtils.getNextConnection(this.predecessorBlockId_, workspace);
  var successorPrevConnection =
      SpeechBlocks.BlockUtils.getPreviousConnection(blockId, workspace);
  predecessorNextConnection.connect(successorPrevConnection);
};
