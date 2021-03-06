/** 
 * Generates all the GET commands
 * @param : List of all possible block types
 * @return: List of all valid GET commands for the block tpes
 */
CommandGenerator.prototype.generateGetCommands = function (blockTypes) {
  blockTypes.forEach(function (btype) {
    this.commands.push('get a ' + btype + ' block');
  }.bind(this));
}

/**
 * Generates all the special commands that are unique
 * @return List of all special commands that are manual added
 */
CommandGenerator.prototype.generateSpecialCommands = function () {
  this.commands.push('run the program');
  this.commands.push('go to the next level');
  this.commands.push('stay on this level');
}

/**
 * Generates all the CONNECT commands
 * @param blockIds: List of all block IDs that are presume to be in the workspace
 * @return List of all valid CONNECT commands
 */
CommandGenerator.prototype.generateConnectCommands = function (blockIds) {
  blockIds.forEach(function (blockId1) {
    blockIds.forEach(function (blockId2) {
      this.commands.push('connect block ' + blockId1 + ' under block ' + blockId2);
      this.commands.push('connect block ' + blockId1 + ' inside block ' + blockId2);
    }.bind(this));
  }.bind(this));
}

/**
 * Generates all the SEPARATE commands
 * @param blockIds: List of all block IDs that are presume to be in the workspace
 * @return List of all valid SEPARATE commands
 */
CommandGenerator.prototype.generateSeparateCommands = function (blockIds) {
  blockIds.forEach(function (blockId) {
    this.commands.push('separate block ' + blockId);
  }.bind(this));
}

/**
    Generates all CHANGE commands
    @param blockIds: List of all block IDs that are presumed to be in the workspace
    @param List of all value sets for fields
    @return List of all CHANGE commands
 */
CommandGenerator.prototype.generateChangeCommands = function (blockIds, blockValuesetMap) {
  blockValuesetMap.keys_.forEach(function (blockId) {
    blockValuesetMap.get(blockId).forEach(function (valueSet) {
      valueSet.forEach(function (value1) {
        valueSet.forEach(function (value2) {
          if (value1 != value2) {
            this.commands.push('change ' + value1 + ' in block ' + blockId + ' to ' + value2);
          }
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }.bind(this));
}

/**
 * Generates all DELETE commands
 * @param blockIds: List of all block IDs that are presumed in the workspace
 * @return List of all valid DELETE commands
 */
CommandGenerator.prototype.generateDeleteCommands = function (blockIds) {
  blockIds.forEach(function (blockId) {
    this.commands.push('delete block ' + blockId);
  }.bind(this));
}

/**
 * Generates all possible commands give a list of block IDs, block types and field values
 * @param blockIds: List of all block IDs that are presumed to be in the worspace
 * @param List of all valid block types
 * @param List of all field value sets
 * @return The complete list of valid commands
 */
CommandGenerator.prototype.generateCommands = function (blockIds, blockValuesetMap, blockTypes) {
  this.commands = new Array();
  this.generateGetCommands(blockTypes);
  this.generateConnectCommands(blockIds);
  this.generateChangeCommands(blockIds, blockValuesetMap);
  this.generateDeleteCommands(blockIds);
  this.generateSeparateCommands(blockIds);
  this.generateSpecialCommands();
  return this.commands;
}

function CommandGenerator() { this.commands = new Array(); }