/**
 * @fileoverview Helper methods for fetching blocks and connections.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.BlockUtils');

goog.require('Blockly.Connection');
goog.require('goog.asserts');

/**
 * Gets the block from the workspace.
 * @param {?string} blockId
 * @param {!Blockly.Workspace} workspace
 * @return {!Blockly.Block}
 * @public
 */
SpeechBlocks.BlockUtils.getBlock = function(blockId, workspace) {
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
SpeechBlocks.BlockUtils.getPreviousConnection = function(blockId, workspace) {
  return SpeechBlocks.BlockUtils.asConnection_(
      SpeechBlocks.BlockUtils.getBlock(blockId, workspace).previousConnection);
};

/**
 * Asserts that the block has a next connections and returns the connection.
 * @param {string} blockId
 * @param {!Blockly.Workspace} workspace
 * @return {!Blockly.Connection}
 * @public
 */
SpeechBlocks.BlockUtils.getNextConnection = function(blockId, workspace) {
  return SpeechBlocks.BlockUtils.asConnection_(
      SpeechBlocks.BlockUtils.getBlock(blockId, workspace).nextConnection);
};

/**
 * @param {string} blockId
 * @param {!Blockly.Workspace} workspace
 * @return {!Blockly.Connection}
 * @public
 */
SpeechBlocks.BlockUtils.getChainNextConnection = function(blockId, workspace) {
  return SpeechBlocks.BlockUtils.asConnection_(
      SpeechBlocks.BlockUtils.getLastBlockInChain_(blockId, workspace).nextConnection);
};

/**
 * Asserts that the block has an output connection and returns the connection.
 * @param {string} blockId
 * @param {!Blockly.Workspace} workspace
 * @return {!Blockly.Connection}
 * @public
 */
SpeechBlocks.BlockUtils.getOutputConnection = function(blockId, workspace) {
  return SpeechBlocks.BlockUtils.asConnection_(
      SpeechBlocks.BlockUtils.getBlock(blockId, workspace).outputConnection);
};

/**
 * Asserts that the block has the input and the input's connection.
 * @param {string} blockId
 * @param {string} inputName
 * @param {!Blockly.Workspace} workspace
 * @return {!Blockly.Connection}
 * @public
 */
SpeechBlocks.BlockUtils.getInputConnection = function(blockId, inputName, workspace) {
  return SpeechBlocks.BlockUtils.asConnection_(
      SpeechBlocks.BlockUtils.getInput_(blockId, inputName, workspace).connection);
};

/**
 * Returns true if the blocks belong to the same chain, false otherwise.
 *  
 * Here, the term "chain"" refers to all blocks after the given block.
 * Note this includes nested structures; e.g., a repeat block's
 * statement inputs belong to the same chain as the repeat block itself.
 * 
 * @param {string} blockId1
 * @param {string} blockId2
 * @param {!Blockly.Workspace} workspace
 * @return {boolean}
 * @public
 */
SpeechBlocks.BlockUtils.areBlocksInSameChain = function(blockId1, blockId2, workspace) {
  var toCheck = [SpeechBlocks.BlockUtils.getBlock(blockId1, workspace)];
  while (toCheck) {
    var curr = toCheck.pop();

    // If we found the block, we're done.
    if (curr.id == blockId2) {
      return true;
    }

    // Otherwise, add all connected blocks to the queue.
    var conn = SpeechBlocks.BlockUtils.asConnection_(curr.nextConnection);
    if (conn.isConnected()) {
      toCheck.push(SpeechBlocks.BlockUtils.getConnectionTarget_(conn));
    }

    conn = SpeechBlocks.BlockUtils.asConnection_(curr.outputConnection);
    if (conn.isConnected()) {
      toCheck.push(SpeechBlocks.BlockUtils.getConnectionTarget_(conn));
    }

    curr.inputsList.forEach(function(input) {
      if (input.connection.isConnected()) {
        toCheck.push(input.connection.targetConnection.getSourceBlock());
      }
    });
  }
  return false;
};

/**
 * Gets the input object for the given block.
 * @param {string} blockId
 * @param {stirng} inputName
 * @return {!Blockly.Input}
 * @private
 */
SpeechBlocks.BlockUtils.getInput_ = function(blockId, inputName, workspace) {
  return goog.asserts.assertInstanceof(
      SpeechBlocks.BlockUtils.getBlock(blockId, workspace).getInput(inputName),
      Blockly.Input);
};

/**
 * Traverses the chain of blocks and returns a reference to the last.
 * @param {string} blockId ID of the first block in the chain.
 * @return {!Blockly.Block} ID of the last block in the chain.
 * @private
 */
SpeechBlocks.BlockUtils.getLastBlockInChain_ = function(blockId, workspace) {
  var curr = SpeechBlocks.BlockUtils.getBlock(blockId, workspace);
  while (curr.nextConnection && curr.nextConnection.isConnected()) {
    curr = curr.nextConnection.targetConnection.getSourceBlock();
  }
  return curr;
};

/**
 * @param {!Blockly.Connection} connection
 * @return {!Blockly.Block} The connection target.
 * @private
 */
SpeechBlocks.BlockUtils.getConnectionTarget_= function(connection) {
  return goog.asserts.assertInstanceof(
      goog.asserts.assertInstanceof(
          connection.targetConnection, Blockly.Connection),
      Blockly.Block);
}

/**
 * Asserts that the connection is not null.
 * @param {?Blockly.Connection}
 * @return {!Blockly.Connection}
 * @private
 */
SpeechBlocks.BlockUtils.asConnection_ = function(connection) {
  return goog.asserts.assertInstanceof(connection, Blockly.Connection);
};
