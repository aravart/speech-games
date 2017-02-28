/**
 * @fileoverview Represents a value input connection point for a block.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.ValueInput');

goog.require('Blockly.constants');
goog.require('SpeechBlocks.Animator');
goog.require('SpeechBlocks.BlockUtils');
goog.require('goog.asserts');

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
SpeechBlocks.ValueInput.prototype.place = function(blockId, workspace, opt_animator) {
  // If the successor block comes after the given block in the same chain,
  // the placement is invalid.
  if (SpeechBlocks.BlockUtils.areBlocksInSuccession(
      blockId, this.parentBlockId_, workspace)) {
    throw 'Block ' + blockId + ' and block ' + this.parentBlockId_ + ' are connected!';
  }

  if (opt_animator) {
    this.placeWithAnimation_(
        blockId,
        workspace,
        goog.asserts.assertInstanceof(opt_animator, SpeechBlocks.Animator));
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
SpeechBlocks.ValueInput.prototype.placeProgrammatically_ = function(blockId, workspace) {
  var parentInputConnection =
      SpeechBlocks.BlockUtils.getInputConnection(this.parentBlockId_, this.inputName_, workspace);
  var childOutputConnection =
      SpeechBlocks.BlockUtils.getOutputConnection(blockId, workspace);
  parentInputConnection.connect(childOutputConnection);
};

/**
 * Connects the given block to the value input of the parent block, but does so
 * by emulating a drag-n-drop.
 * 
 * @param {string} blockId The ID of the block to move.
 * @param {!Blockly.Workspace} workspace The current workspace.
 * @param {!SpeechBlocks.Animator} animator The animation manager.
 * @private
 */
SpeechBlocks.ValueInput.prototype.placeWithAnimation_ = function(blockId, workspace, animator) {
  var blockToMove = SpeechBlocks.BlockUtils.getBlock(blockId, workspace);
  var refBlock = SpeechBlocks.BlockUtils.getBlock(this.parentBlockId_, workspace);

  var refXY = refBlock.getRelativeToSurfaceXY();
  refXY.x += refBlock.getHeightWidth().width / 2;
  refXY.y += refBlock.getHeightWidth().height / 2;

  // Move the block to the middle of the parent block, and then
  // programmatically snap the block to the correct input.
  animator.animateRelativeTranslation(
      blockId,
      blockToMove.getRelativeToSurfaceXY(),
      refXY,
      goog.bind(this.placeProgrammatically, this, blockId, workspace));
};
