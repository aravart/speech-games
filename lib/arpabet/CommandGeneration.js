/**
 * @author Trace Carrasco <tcarrasco@wisc.edu> 
 * @author David Liang <david.liang@wisc.edu>
 */
 
function CommandGeneration() { }

// Generates all the GET commands
// Args: List of all possible block types
// Returns: List of all valid GET commands for the block tpes
CommandGeneration.prototype.generateGetCommands = function(block_types) {
    var commands = [];
    block_types.forEach(function (btype) {
        commands.push('get a ' + btype + ' block');
	});
    return commands;
}

// Generates all the special commands that are unique
// Returns: List of all special commands that are manual added
CommandGeneration.prototype.generateSpecialCommands = function() {
	var commands = [];
	commands.push('run the program');
	commands.push('go to the next level');
	commands.push('go to next level');
	commands.push('stay on this level');
	return commands;
}

// Generates all the MOVE commands
// Args: List of all block IDs that are presume to be in the workspace
// Returns: List of all valid MOVE commands
CommandGeneration.prototype.generateMoveCommands = function(blockIds) {
    var commands = [];
	var even = false;
    blockIds.forEach(function (blockid1) {
		blockIds.forEach(function (blockid2) {
			// Redundents, but we can get rid of these later
			commands.push('connect block ' + blockid1 + ' under block ' + blockid2);
			commands.push('connect block ' + blockid1 + ' inside block ' + blockid2);
		});
	});
    return commands;
}

// Generates all CHANGE commands
// Args: blockIds: List of all block IDs that are presumed to be in the workspace
//		 valueSets: List of all value sets for fields
// Returns: List of all CHANGE commands
CommandGeneration.prototype.generateChangeCommands = function(blockIds, valueSets) {
	var commands = [];
	blockIds.forEach(function (blockId) {
		valueSets.forEach(function(value_set) {
			for(var i = 0; i < value_set.length - 1; i++) {
				for(var j = i + 1; j < value_set.length; j++) {
					commands.push('change ' + value_set[i] + ' in block ' + blockId + ' to ' + value_set[j]);
					commands.push('change ' + value_set[j] + ' in block ' + blockId + ' to ' + value_set[i]);
				}
			}
		});
	});
	return commands;
}

// Generates all DELETE commands
// Args: blockIds: List of all block IDs that are presumed in the workspace
// Returns: List of all valid DELETE commands
CommandGeneration.prototype.generateDeleteCommands = function(blockIds) {
	var commands = [];
	blockIds.forEach(function(blockId) { 
		commands.push('delete block ' + blockId);
	});
	return commands;
}

// Generates all possible commands give a list of block IDs, block types and field values
// Args: blockIds: List of all block IDs that are presumed to be in the worspace
//       block_types: List of all valid block types
//       valueSets: List of all field value sets
// Returns: The complete list of valid commands
CommandGeneration.prototype.generateCommands = function(blockIds, block_types, valueSets) {
	var commands = [];
	commands.extend(this.generateGetCommands(block_types));
	commands.extend(this.generateMoveCommands(blockIds));
	commands.extend(this.generateChangeCommands(blockIds, valueSets));
	commands.extend(this.generateDeleteCommands(blockIds));
	commands.extend(this.generateSpecialCommands());
	return commands;
}

Array.prototype.extend = function(element_list) {
	element_list.forEach(function(e) { this.push(e)}, this);
}