/**
 * @fileoverview Provides functionality for animating block movements
 * and block creations. Remains agnostic of block and workspace objects.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.Animator');

goog.require('goog.math.Coordinate')
goog.require('goog.structs.Map');

/** @constructor */
SpeechBlocks.Animator = function() {
  /** 
   * Blockly injects the toolbox without assigning IDs to the blocks elements
   * in the toolbox. As such, we need to map block types to identifying text
   * within the block's fields.
   * 
   * TODO(ehernandez4): Find a way to assign IDs to toolbox SVG elements.
   * 
   * @private @const {!goog.structs.Map<string, string>}
   */
  this.toolboxIdMap_ = new goog.structs.Map();
  
  // Initialize the toolbox map.
  var children = $('#toolbox').children();
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    this.toolboxIdMap_.set(child.getAttribute('type'), child.getAttribute('text'));
  }
};

/**
 * Drags a new block of the given type from the toolbox.
 * @param {string} type The type of the block to create.
 * @param {!goog.math.Coordinate} workspaceXY The target location on the workspace
 *    where the new block should be placed.
 * @param {Function()=} opt_onComplete A callback for when the animation finishes.
 * @public
 */
SpeechBlocks.Animator.prototype.animateBlockCreation = function(
    type, workspaceXY, opt_onComplete) {
  if (!this.toolboxIdMap_.containsKey(type)) {
    throw 'Bad block type provided to animator!';
  };
  
  var blockSelector = this.getToolboxBlockSelector_(type);
  var toolboxSelector = '.blocklyFlyout';

  // TODO(ehernandez4): There's a small error in this calculation, causing the
  // block to be placed ~5px off from its destination.
  var dx = workspaceXY.x + (
    $(toolboxSelector)[0].getBoundingClientRect().width - (
        $(blockSelector).position().left - $(toolboxSelector).position().left));
  var dy = workspaceXY.y - (
      $(blockSelector).position().top - $(toolboxSelector).position().top);

  this.animate_(blockSelector, dx, dy, opt_onComplete);
};

/**
 * Moves the block by dx and dy, animating the process.
 * @param {string} blockId The ID of the block to animate.
 * @param {number} dx The change in the block's x coordinate.
 * @param {number} dy The change in the block's y coordinate.
 * @param {Function()=} opt_onComplete A callback for when the animation finishes. 
 * @public
 */
SpeechBlocks.Animator.prototype.animateTranslation = function(
    blockId, dx, dy, opt_onComplete) {
  this.animate_(this.getBlockSelector_(blockId), dx, dy, opt_onComplete);
};

/**
 * Animates the movement of an existing block with respect to a reference point.
 * For example, the reference XY might be the output connection of a value block,
 * and that target XY is the value input to which the output must connect.
 * 
 * @param {string} block The ID of the block to move.
 * @param {!goog.math.Coordinate} refXY The coordinates of the refernce point.
 * @param {!goog.math.Coordinate} targetXY The target coordinates;
 *    that is, the point where the block is to be moved.
 * @param {Function()=} opt_onComplete A callback for when the animation finishes.
 * @public
 */
SpeechBlocks.Animator.prototype.animateRelativeTranslation = function(
    blockId, refXY, targetXY, opt_onComplete) {
  this.animate_(
      this.getBlockSelector_(blockId),
      targetXY.x - refXY.x,
      targetXY.y - refXY.y,
      opt_onComplete);
};

/**
 * @param {string} selector The jQuery selector of the element to animate.
 * @param {number} dx The x-distance to drag.
 * @param {number} dy The y-distance to drag.
 * @param {Function()=} opt_onComplete A callback for when the animation finishes.
 * @public
 */
SpeechBlocks.Animator.prototype.animate_ = function(selector, dx, dy, opt_onComplete) {
  var options = {
    dx: dx,
    dy: dy,
    interpolation: {
      // TODO(ehernandez4): The options below should be injected.
      stepCount: 75,
      stepDelay: 1
    }
  };
  if (opt_onComplete) {
    options['callback'] = opt_onComplete;
  }
  $(selector).simulate('drag-n-drop', options);
};

/**
 * Returns the jQuery selector for corresponding toolbox element.
 * @param {string} type The type of the block to create.
 * @return {string} The jQuery selector for this type.
 * @private
 */
SpeechBlocks.Animator.prototype.getToolboxBlockSelector_ = function(type) {
  return '.blocklyFlyout text:contains("' + this.toolboxIdMap_.get(type) + '")';
};

/**
 * Returns the jQuery selector for the given block.
 * @param {string} blockId The ID of the block to select.
 * @return {string} The jQuery selector.
 * @private
 */
SpeechBlocks.Animator.prototype.getBlockSelector_ = function(blockId) {
  // The workspace stores block IDs in the class of the block text field.
  // TODO(ehernandez4): Normalize block IDs to be consistent within the workspace
  // and within the HTML.
  return '.block' + blockId;
};