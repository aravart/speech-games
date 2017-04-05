/**
 * @fileoverview A simple value class for workspace state.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.WorkspaceState');

goog.require('SpeechBlocks.BlockUtils');
goog.require('SpeechBlocks.FieldTypes');

/**
 * The state of the workspace with respect to program structure.
 * @constructor
 * @private
 */
SpeechBlocks.WorkspaceState = function() {
  /** 
   * True if the workspace is empty, false otherwise.
   * @public 
   */
  this.empty = false;

  /**
   * True if all blocks are unconnected, false if there is at least one
   * pair of blocks for which there is no connection path from one to the other.
   * @public
   */
  this.allBlocksConnected = false;

  /**
   * True if at least one block in the workspace contains
   * a modifiable field, false otherwise.
   * @public
   */
  this.blocksAreModifiable = false;
};

/**
 * Checks whether this state and the state of the provided workspace are the same.
 * 
 * This is implemented as a hyper-simplified object-equals function. Should work
 * for this use case because state fields will be no more complicated than
 * booleans and integers.
 * 
 * @param {!SpeechBlocks.WorkspaceState} state The state to check for equality
 * @return {boolean} True if given state matches this state, false otherwise.
 */
SpeechBlocks.WorkspaceState.prototype.equals = function(state) {
  var same = true;
  for (var property in state) {
    same = same && state[property] == this[property];
  }
  return same;
};

/**
 * @param {!Blockly.Workspace} workspace The workspace whose state we must determine.
 * @return {!SpeechBlocks.WorkspaceState} The current state of the workspace.
 */
SpeechBlocks.WorkspaceState.stateOf = function(workspace) {
  var state = new SpeechBlocks.WorkspaceState();

  var blocks = workspace.getAllBlocks();
  if (!blocks.length) {
    state.empty = true;
    return state;
  }

  state.allBlocksConnected = true;
  var refBlock = blocks[0];
  blocks.forEach(function(block) {
    // Check for unconnected blocks.
    if (!SpeechBlocks.BlockUtils.areBlocksConnected(refBlock.id, block.id, workspace)) {
      state.allBlocksConnected = false;
    }

    // Check for blocks with fields.
    block.inputList.forEach(function(input) {
      input.fieldRow.forEach(function(field) {
        if (SpeechBlocks.FieldTypes.typeOf(field) != SpeechBlocks.FieldTypes.IRRELEVANT) {
          state.blocksAreModifiable = true;
        }
      });
    });
  });
  return state;
};