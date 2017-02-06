/**
 * @fileoverview An enumeration of workspace semantic states.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.WorkspaceStates');

goog.require('SpeechBlocks.BlockUtils');

/**
 * The state of the workspace with respect to program structure.
 * @enum {number}
 */
SpeechBlocks.WorkspaceStates = {
  /** The workspace is empty. */
  EMPTY: 1,

  /** All blocks in the workspace are connected. */
  ALL_BLOCKS_CONNECTED: 2,

  /** Some blocks are unconnected. */
  BLOCKS_UNCONNECTED: 3
};

/**
 * @param {!Blockly.Workspace} workspace The workspace whose state we must determine.
 * @return {number} The current state of the workspace.
 */
SpeechBlocks.WorkspaceStates.stateOf = function(workspace) {
  var blocks = workspace.getAllBlocks();
  if (blocks.length == 0) {
    return SpeechBlocks.WorkspaceStates.EMPTY;
  }
  var state = SpeechBlocks.WorkspaceStates.ALL_BLOCKS_CONNECTED;
  var refBlock = blocks[0];
  blocks.forEach(function(block) {
    if (!SpeechBlocks.BlockUtils.areBlocksConnected(refBlock.id, block.id, workspace)) {
      state = SpeechBlocks.WorkspaceStates.BLOCKS_UNCONNECTED;
    }
  });
  return state;
};