/**
 * @fileoverview Represents the "successor" connection point of a block.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.Successor');

goog.require('SpeechBlocks.Blocks');

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
  var predecessorNextConnection =
      SpeechBlocks.Blocks.getNextConnection(this.predecessorBlockId_, workspace);
  var successorPrevConnection =
      SpeechBlocks.Blocks.getPreviousConnection(blockId, workspace);
  predecessorNextConnection.connect(successorPrevConnection);
};
