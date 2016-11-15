/**
 * @fileoverview Represents the "predecessor" connection point of a block.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.Predecessor');

goog.require('SpeechBlocks.Blocks');

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
  var successorPrevConnection =
      SpeechBlocks.Blocks.getPreviousConnection(this.successorBlockId_, workspace);
  if (successorPrevConnection.isConnected()) {
    var chainPrevConnection =
        SpeechBlocks.Blocks.getPreviousConnection(blockId, workspace);
    successorPrevConnection.targetConnection.connect(chainPrevConnection);
  }
  var chainNextConnection =
      SpeechBlocks.Blocks.getChainNextConnection(blockId, workspace);
  successorPrevConnection.connect(chainNextConnection); 
};

