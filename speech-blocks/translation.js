/** 
 * @fileoverview Represents an xy translation on the workspace
 * where a block can exist as a singleton.
 * @author ehernandez4@wisc.edu (Evan Hernandez)  
 */
'use strict';

goog.provide('SpeechBlocks.Translation');

goog.require('SpeechBlocks.Animator');
goog.require('SpeechBlocks.Blocks');
goog.require('goog.asserts');

/**
 * @param {number} dx Change in x position.
 * @param {number} dy Change in y position.
 * @extends {SpeechBlocks.Where}
 * @constructor
 */
SpeechBlocks.Translation = function(dx, dy) { 
  /** @private @const */
  this.dx_ = dx;

  /** @private @const */
  this.dy_ = dy;
};

/**
 * Places the block with the given ID at the top-level position.
 * @override 
 */
SpeechBlocks.Translation.prototype.place = function(blockId, workspace, opt_animator) {
  if (opt_animator) {
    this.placeWithAnimation_(
        blockId,
        workspace,
        goog.asserts.assertInstanceof(opt_animator, SpeechBlocks.Animator));
    return;
  }
  SpeechBlocks.BlockUtils.getBlock(blockId, workspace).moveBy(this.dx_, this.dy_);
};

/**
 * Translates the block, and animates the process.
 * 
 * @param {string} blockId The ID of the block to move.
 * @param {!Blockly.Workspace} workspace The current workspace.
 * @param {!SpeechBlocks.Animator} animator The animation manager.
 * @private
 */
SpeechBlocks.Translation.prototype.placeWithAnimation_ = function(blockId, workspace, animator) {
  animator.animateTranslation(
      blockId,
      this.dx_,
      this.dy_,
      function() { SpeechBlocks.BlockUtils.getBlock(blockId, workspace).unselect(); });
};
