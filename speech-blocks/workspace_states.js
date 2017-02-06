/**
 * @fileoverview An enumeration of workspace semantic states.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.WorkspaceStates');

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
  SOME_BLOCKS_UNCONNECTED: 3
};

/**
 * @param {!Blockly.Workspace} workspace The workspace whose state we must determine.
 * @return {number}
 */
SpeechBlocks.WorkspaceStates.stateOf(workspace) = function() {
  // TODO(ehernandez4): Implement this function.
  return SpeechBlocks.WorkspaceState.EMPTY;
};