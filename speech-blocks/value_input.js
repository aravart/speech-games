/**
 * @fileoverview Represents a value input connection point for a block.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.ValueInput');

goog.require('Blockly.constants');
goog.require('SpeechBlocks.Blocks');

/**
 * @param {string} parentBlockId The ID of the parent block.
 * @param {string} inputName The name of the value input.
 * @extends {SpeechBlocks.Where}
 * @constructor
 */
SpeechBlocks.ValueInput = function(parentBlockId, inputName) {
  /** @private @const */
  this.parentBlockId_ = parentBlockId;

  /** @private @const */
  this.inputName_ = inputName;
};

/**
 * Connects the given block to the value input of the parent block.
 * @override
 */
SpeechBlocks.ValueInput.prototype.place = function(blockId, workspace) {
  var parentInputConnection =
      SpeechBlocks.Blocks.getInputConnection(this.parentBlockId_, this.inputName_, workspace);
  var childOutputConnection =
      SpeechBlocks.Blocks.getOutputConnection(blockId, workspace);
  parentInputConnection.connect(childOutputConnection);
};
