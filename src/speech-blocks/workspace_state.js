/**
 * @fileoverview A simple value class for workspace state.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 * @author dliang@cs.wisc.edu (David Liang)
 */
'use strict';

goog.provide('SpeechBlocks.WorkspaceState');

goog.require('goog.structs.Set');
goog.require('SpeechBlocks.BlockUtils');
goog.require('SpeechBlocks.FieldTypes');

/**
 * The state of the workspace with respect to program structure.
 * @constructor
 * @private
 */
SpeechBlocks.WorkspaceState = function() {
  /**
   * The IDs of blocks on the workspace with no fields or inputs (e.g., move blocks.)
   * By convention, these blocks are assumed to have predecessor and successor connections.
   * @public
   */
  this.ordinaryBlockIds = new goog.structs.Set();

  /**
   * The IDs of blocks on the workspace with statement inputs.
   * @public
   */
  this.statementInputBlockIds = new goog.structs.Set();

  /**
   * The IDs of blocks on the workspace with value inputs.
   * @public
   */
  this.valueInputBlockIds = new goog.structs.Set();

  /**
   * The IDs of blocks on the workspace with modifiable fields.
   * @public
   */
  this.modifiableBlockIds = new goog.structs.Set();

  /**
   * The IDs of all blocks on the workspace.
   * @public
   */
  this.blockIds = new goog.structs.Set();

  /**
   * The set of value sets for blocks with drop downs.
   * @public
   */
  this.blockValuesetMap = new goog.structs.Map();

  /**
   * True if the workspace is empty.
   * 
   * Although this information is in part obtainable by checking whether or not
   * each ID set is empty, there might be blocks that do not fall into any
   * of the above categories.
   * @public
   */
  this.empty = false;

  /**
   * True if all blocks are unconnected, false if there is at least one
   * pair of blocks for which there is no connection path from one to the other.
   * @public
   */
  this.allBlocksConnected = false;
};

/**
 * Checks whether this state and the state of the provided workspace are the same.
 * 
 * @param {!SpeechBlocks.WorkspaceState} state The state to check for equality
 * @return {boolean} True if given state matches this state, false otherwise.
 */
SpeechBlocks.WorkspaceState.prototype.equals = function(state) {
  return this.ordinaryBlockIds.equals(state.ordinaryBlockIds)
      && this.statementInputBlockIds.equals(state.statementInputBlockIds)
      && this.valueInputBlockIds.equals(state.valueInputBlockIds)
      && this.modifiableBlockIds.equals(state.modifiableBlockIds)
      && this.blockValuesetMap.equals(state.blockValuesetMap)
      && this.allBlocksConnected == state.allBlocksConnected;
};

/**
 * Returns the WorkspaceState corresponding to the given workspace object.
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
    state.blockIds.add(block.id);

    // Check for unconnected blocks.
    if (!SpeechBlocks.BlockUtils.areBlocksConnected(refBlock.id, block.id, workspace)) {
      state.allBlocksConnected = false;
    }

    // Check for blocks with statement inputs, value inputs, and fields.
    // Also keep track of whether or not the block is ordinary.
    var ordinary = true;
    var valueSets = [];
    block.inputList.forEach(function(input) {
      if (input.type == Blockly.NEXT_STATEMENT) {
        state.statementInputBlockIds.add(block.id);
        ordinary = false;
      } else if (input.type == Blockly.INPUT_VALUE) {
        state.valueInputBlockIds.add(block.id);
        ordinary = false;
      }

      input.fieldRow.forEach(function(field) {
        if (SpeechBlocks.FieldTypes.typeOf(field) != SpeechBlocks.FieldTypes.IRRELEVANT) {
          state.modifiableBlockIds.add(block.id);
          ordinary = false;
        }

        if (field instanceof Blockly.FieldDropdown) {
          var valueSet = [];
          field.menuGenerator_.forEach(function(value) {
            valueSet.push(value[1].toLowerCase().replace("turn","").replace("pen",""));
          });
          valueSets.push(valueSet);
        }
      });
      state.blockValuesetMap.set(block.id, valueSets);
    });
    // Handle case where block is ordinary.
    if (block.previousConnection && block.nextConnection && ordinary) {
      state.ordinaryBlockIds.add(block.id);
    }
  });
  return state;
};