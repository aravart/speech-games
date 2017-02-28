/**
 * @fileoverview Represents a block to which we want to add a child.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict'

goog.provide('SpeechBlocks.StatementInput');

goog.require('SpeechBlocks.BlockUtils');

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
SpeechBlocks.StatementInput.prototype.place = function(blockId, workspace, opt_animator) {
  if (SpeechBlocks.BlockUtils.areBlocksInSuccession(
      blockId, this.parentBlockId_, workspace)) {
    throw 'Block ' + blockId + ' and block ' + this.parentBlockId_ + ' are connected!';
  }

  if (opt_animator) {
    this.placeWithAnimation_(
        blockId,
        workspace,
        goog.asserts.assertInstanceof(opt_animator, SpeechBlocks.Animator));
    return;
  }

  this.placeProgrammatically_(blockId, workspace);
};

/**
 * No bright lights or fancy colors, just move the block without animation.
 * 
 * @param {string} blockId The ID of the block to move.
 * @param {!Blockly.Workspace} workspace The current workspace.
 * @private
 */
SpeechBlocks.StatementInput.prototype.placeProgrammatically_ = function(blockId, workspace) {
  var parentInputConnection =
      SpeechBlocks.BlockUtils.getInputConnection(
          this.parentBlockId_, this.inputName_, workspace);
  var childPreviousConnection =
      SpeechBlocks.BlockUtils.getPreviousConnection(blockId, workspace);
  parentInputConnection.connect(childPreviousConnection);
};

/**
 * Connects the given block to the statement input of the parent block, but does so
 * by emulating a drag-n-drop.
 * 
 * @param {string} blockId The ID of the block to move.
 * @param {!Blockly.Workspace} workspace The current workspace.
 * @param {!SpeechBlocks.Animator} animator The animation manager.
 * @private
 */
SpeechBlocks.StatementInput.prototype.placeWithAnimation_ = function(blockId, workspace, animator) {
  var blockToMove = SpeechBlocks.BlockUtils.getBlock(blockId, workspace);
  var refBlock = SpeechBlocks.BlockUtils.getBlock(this.parentBlockId_, workspace);

  var refXY = refBlock.getRelativeToSurfaceXY();
  refXY.x += refBlock.getHeightWidth().width / 3;
  refXY.y += refBlock.getHeightWidth().height / 3;

  // Move the block to the middle of the parent block, and then
  // programmatically snap the block to the correct input.
  animator.animateRelativeTranslation(
      blockId,
      blockToMove.getRelativeToSurfaceXY(),
      refXY,
      goog.bind(this.placeProgrammatically_, this, blockId, workspace));
};