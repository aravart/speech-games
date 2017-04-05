/**
 * @fileoverview Helper methods for fetching blocks and connections.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.BlockUtils');

goog.require('Blockly.Block');
goog.require('Blockly.Connection');
goog.require('Blockly.Input');
goog.require('Blockly.Workspace');
goog.require('goog.asserts');

/**
 * Gets the block from the workspace.
 * @param {string} blockId
 * @param {!Blockly.Workspace} workspace
 * @return {!Blockly.Block}
 * @public
 */
SpeechBlocks.BlockUtils.getBlock = function(blockId, workspace) {
  return goog.asserts.assertInstanceof(
      workspace.getBlockById(blockId), Blockly.Block);
};

/**
 * Returns an array of all blocks in the same chain as the given block,
 * including the block itself. No particular order.
 * @param {string} blockId
 * @param {!Blockly.Workspace} workspace
 * @return {!Array<!Blockly.Block>}
 * @public
 */
SpeechBlocks.BlockUtils.getBlocksInChain = function(blockId, workspace) {
  return SpeechBlocks.BlockUtils.getSuccessorBlocks_(
      SpeechBlocks.BlockUtils.getFirstTopBlockInChain(blockId, workspace).id,
      workspace);
};

/**
 * Traverses the chain of blocks and returns the first block at the highest level.
 * @param {string} blockId
 * @param {!Blockly.Workspace} workspace
 * @return {!Blockly.Block}
 * @public
 */
SpeechBlocks.BlockUtils.getFirstTopBlockInChain = function(blockId, workspace) {
  // TODO(ehernandez4): Technically, this should consider output connections
  // as part of the predecessor search. Since we don't currently use blocks
  // with value outputs, this is omitted for now.
  var curr = SpeechBlocks.BlockUtils.getBlock(blockId, workspace);
  while (curr.previousConnection) {
    var conn = SpeechBlocks.BlockUtils.asConnection_(curr.previousConnection);
    if (!conn.isConnected()) {
      break;
    }
    curr = SpeechBlocks.BlockUtils.getConnectionTarget_(conn);
  }
  return curr;
};

/**
 * Asserts that the block has a previous connection and returns the connection.
 * @param {string} blockId
 * @param {!Blockly.Workspace} workspace
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
 * Gets the next connection of the last block in the chain.
 * @param {string} blockId
 * @param {!Blockly.Workspace} workspace
 * @return {!Blockly.Connection}
 * @public
 */
SpeechBlocks.BlockUtils.getChainNextConnection = function(blockId, workspace) {
  // Traverse to the end of the chain, then return the connection.
  var curr = SpeechBlocks.BlockUtils.getBlock(blockId, workspace);
  while (curr.nextConnection && curr.nextConnection.isConnected()) {
    curr = curr.nextConnection.targetConnection.getSourceBlock();
  }
  return SpeechBlocks.BlockUtils.asConnection_(curr.nextConnection);
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
 * Disconnects the block from all its neighbors, if any.
 * @param {string} blockId
 * @param {!Blockly.Workspace} workspace
 * @public
 */
SpeechBlocks.BlockUtils.isolateBlock = function(blockId, workspace) {
  var block = SpeechBlocks.BlockUtils.getBlock(blockId, workspace);
  
  // Unplug the block from its predecessor and successor, healing the stack.
  block.unplug(true /* Heal the stack! */);

  // Then unplug the block's statement/value inputs.
  block.inputList.forEach(function(input) {
    if (input.connection) {
      var conn = SpeechBlocks.BlockUtils.asConnection_(input.connection);
      conn.disconnect();
    }
  });
};

/**
 * Returns true if the blocks are connected directly or indirectly.
 * 
 * This function offers a looser definition of "connected" than its sibling
 * function, areBlocksInSuccession. Here, we do not take into account the order 
 * of block1 and block2 - as long as there is some path from one to the other,
 * they are connected.
 * 
 * @param {string} block1Id
 * @param {string} block2Id
 * @param {!Blockly.Workspace} workspace
 * @return {boolean}
 */
SpeechBlocks.BlockUtils.areBlocksConnected = function(block1Id, block2Id, workspace) {
  return SpeechBlocks.BlockUtils.areBlocksInSuccession(block1Id, block2Id, workspace)
      || SpeechBlocks.BlockUtils.areBlocksInSuccession(block2Id, block1Id, workspace);
};

/**
 * Returns true if refBlock succeeds blockToFind, false otherwise.
 *  
 * Here, the term "succession" refers to all blocks after a given block.
 * Note this includes nested structures; e.g., a repeat block's
 * statement inputs belong to the same chain as the repeat block itself.
 * 
 * @param {string} refBlockId The block to treat as the chain start.
 * @param {string} blockToFindId The id of the block to search for in the chain.
 * @param {!Blockly.Workspace} workspace
 * @return {boolean}
 * @public
 */
SpeechBlocks.BlockUtils.areBlocksInSuccession = function(refBlockId, blockToFindId, workspace) {
  var blocksAreInSuccession = false;
  SpeechBlocks.BlockUtils.getSuccessorBlocks_(refBlockId, workspace).forEach(function(block) {
    if (block.id == blockToFindId) {
      blocksAreInSuccession = true;
    }
  });
  return blocksAreInSuccession;
};

/**
 * Returns all blocks that succeed this block in its chain.
 * Includes the block itself. No particular order.
 * @param {string} blockID
 * @param {!Blockly.Workspace} workspace
 * @return {!Array<!Blockly.Block>}
 * @private
 */
SpeechBlocks.BlockUtils.getSuccessorBlocks_ = function(blockId, workspace) {
  var startBlock = SpeechBlocks.BlockUtils.getBlock(blockId, workspace)
  var toCheck = [startBlock];
  var visited = [startBlock];
  while (toCheck.length > 0) {
    var curr = toCheck.pop();

    // Otherwise, add all connected blocks to the queue.
    var conn; 
    if (curr.nextConnection) {
      conn = SpeechBlocks.BlockUtils.asConnection_(curr.nextConnection);
      if (conn.isConnected()) {
        var nextBlock = SpeechBlocks.BlockUtils.getConnectionTarget_(conn);
        toCheck.push(nextBlock);
        visited.push(nextBlock);
      }
    }

    if (curr.outputConnection) {
      conn = SpeechBlocks.BlockUtils.asConnection_(curr.outputConnection);
      if (conn.isConnected()) {
        var outputTarget = SpeechBlocks.BlockUtils.getConnectionTarget_(conn);
        toCheck.push(outputTarget);
        visited.push(outputTarget);
      }
    }

    curr.inputList.forEach(function(input) {
      if (!input.connection) {
        return;
      }
      conn = SpeechBlocks.BlockUtils.asConnection_(input.connection);
      if (conn.isConnected()) {
        var inputTarget = SpeechBlocks.BlockUtils.getConnectionTarget_(conn);
        toCheck.push(inputTarget);
        visited.push(inputTarget);
      }
    });
  }
  return visited;
};

/**
 * Gets the input object for the given block.
 * @param {string} blockId
 * @param {string} inputName
 * @return {!Blockly.Input}
 * @private
 */
SpeechBlocks.BlockUtils.getInput_ = function(blockId, inputName, workspace) {
  return goog.asserts.assertInstanceof(
      SpeechBlocks.BlockUtils.getBlock(blockId, workspace).getInput(inputName),
      Blockly.Input);
};

/**
 * Returns the target of the given connection.
 * @param {!Blockly.Connection} connection
 * @return {!Blockly.Block}
 * @private
 */
SpeechBlocks.BlockUtils.getConnectionTarget_= function(connection) {
  return goog.asserts.assertInstanceof(
      SpeechBlocks.BlockUtils.asConnection_(connection.targetConnection).getSourceBlock(),
      Blockly.Block);
}

/**
 * Asserts that the connection is not null.
 * @param {?Blockly.Connection} connection
 * @return {!Blockly.Connection}
 * @private
 */
SpeechBlocks.BlockUtils.asConnection_ = function(connection) {
  return goog.asserts.assertInstanceof(connection, Blockly.Connection);
};
