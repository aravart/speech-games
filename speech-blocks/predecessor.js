/**
 * @fileoverview Represents the "predecessor" connection point of a block.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.Predecessor');

goog.require('SpeechBlocks.BlockUtils');

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
SpeechBlocks.Predecessor.prototype.place = function(blockId, workspace) {
  // If the successor block comes after the given block in the same chain,
  // the placement is invalid.
  if (SpeechBlocks.BlockUtils.areBlocksInSuccession(
      blockId, this.successorBlockId_, workspace)) {
    throw 'Block ' + blockId + ' and block ' + this.successorBlockId_ + ' are connected!';
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
};

