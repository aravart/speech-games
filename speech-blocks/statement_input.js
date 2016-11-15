/**
 * @fileoverview Represents a block to which we want to add a child.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict'

goog.provide('SpeechBlocks.StatementInput');

goog.require('SpeechBlocks.Blocks');

/**
 * @param {string} parentBlockId The ID of the parent block.
 * @param {string} inputName The name of the statement input.
 * @param {!Blockly.Workspace} workspace The current workspace.
 * @extends {SpeechBlocks.Where}
 * @constructor
 */
SpeechBlocks.StatementInput = function(parentBlockId, inputName) {
  /** @private @const */
  this.parentBlockId_ = parentBlockId;

  /** @private @const */
  this.inputName_ = inputName;
};

/**
 * Places the block as the first statement input of the given parent block field.
 * @override
 */
SpeechBlocks.StatementInput.prototype.place = function(blockId, workspace) {
  var parentInputConnection =
      SpeechBlocks.Blocks.getInputConnection(
          this.parentBlockId_, this.inputName_, workspace);
  var childPreviousConnection =
      SpeechBlocks.Blocks.getPreviousConnection(blockId, workspace);
  parentInputConnection.connect(childPreviousConnection);
};
