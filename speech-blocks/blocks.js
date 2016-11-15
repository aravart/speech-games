/**
 * @fileoverview Helper methods for fetching blocks and connections.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.Blocks');

goog.require('Blockly.Connection');
goog.require('goog.asserts');

/**
 * Gets the block from the workspace.
 * @param {?string} blockId
 * @param {!Blockly.Workspace} workspace
 * @return {!Blockly.Block}
 * @public
 */
SpeechBlocks.Blocks.getBlock = function(blockId, workspace) {
  return goog.asserts.assertInstanceof(
      workspace.getBlockById(blockId), Blockly.Block);
};

/**
 * Asserts that the block has a previous connection and returns the connection.
 * @param {string} blockId ID of the block.
 * @param {!Blockly.Workspace} workspace Current workspace.
 * @return {!Blockly.Connection}
 * @public
 */
SpeechBlocks.Blocks.getPreviousConnection = function(blockId, workspace) {
  return SpeechBlocks.Blocks.asConnection_(
      SpeechBlocks.Blocks.getBlock(blockId, workspace).previousConnection);
};

/**
 * Asserts that the block has a next connections and returns the connection.
 * @param {string} blockId
 * @param {!Blockly.Workspace} workspace
 * @return {!Blockly.Connection}
 * @public
 */
SpeechBlocks.Blocks.getNextConnection = function(blockId, workspace) {
  return SpeechBlocks.Blocks.asConnection_(
      SpeechBlocks.Blocks.getBlock(blockId, workspace).nextConnection);
};

/**
 * @param {string} blockId
 * @param {!Blockly.Workspace} workspace
 * @public
 */
SpeechBlocks.Blocks.getChainNextConnection = function(blockId, workspace) {
  return SpeechBlocks.Blocks.asConnection_(
      SpeechBlocks.Blocks.getLastBlockInChain_(blockId, workspace).nextConnection);
};

/**
 * Asserts that the block has an output connection and returns the connection.
 * @param {string} blockId
 * @param {!Blockly.Workspace} workspace
 * @return {!Blockly.Connection}
 * @public
 */
SpeechBlocks.Blocks.getOutputConnection = function(blockId, workspace) {
  return SpeechBlocks.Blocks.asConnection_(
      SpeechBlocks.Blocks.getBlock(blockId, workspace).outputConnection);
};

/**
 * Asserts that the block has the input and the input's connection.
 * @param {string} blockId
 * @param {string} inputName
 * @param {!Blockly.Workspace} workspace
 * @return {!Blockly.Connection}
 * @public
 */
SpeechBlocks.Blocks.getInputConnection = function(blockId, inputName, workspace) {
  return SpeechBlocks.Blocks.asConnection_(
    SpeechBlocks.Blocks.getInput_(blockId, inputName, workspace).connection);
};

/**
 * Gets the input object for the given block.
 * @param {string} blockId
 * @param {stirng} inputName
 * @return {!Blockly.Input}
 * @private
 */
SpeechBlocks.Blocks.getInput_ = function(blockId, inputName, workspace) {
  return goog.asserts.assertInstanceof(
      SpeechBlocks.Blocks.getBlock(blockId, workspace).getInput(inputName),
      Blockly.Input);
};

/**
 * Traverses the chain of blocks and returns a reference to the last.
 * @param {string} blockId ID of the first block in the chain.
 * @return {!Blockly.Block} ID of the last block in the chain.
 * @private
 */
SpeechBlocks.Blocks.getLastBlockInChain_ = function(blockId, workspace) {
  var curr = SpeechBlocks.Blocks.getBlock(blockId, workspace);
  while (curr.nextConnection && curr.nextConnection.isConnected()) {
    curr = curr.nextConnection.targetConnection.getSource();
  }
  return curr;
};

/**
 * Asserts that the connection is not null.
 * @param {?Blockly.Connection}
 * @return {!Blockly.Connection}
 * @private
 */
SpeechBlocks.Blocks.asConnection_ = function(connection) {
  return goog.asserts.assertInstanceof(connection, Blockly.Connection);
};
