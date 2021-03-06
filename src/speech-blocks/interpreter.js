/**
 * @fileoverview Interprets a given command and calls workspace controller_.functions.
 * @author dliang@cs.wisc.edu (David Liang), pandori@wisc.edu (Sahib Pandori)
 */
'use strict';

goog.provide('SpeechBlocks.Interpreter');

goog.require('SpeechBlocks.Controller');
goog.require('SpeechBlocks.Layout');
goog.require('SpeechBlocks.Predecessor');
goog.require('SpeechBlocks.StatementInput')
goog.require('SpeechBlocks.Successor');
goog.require('SpeechBlocks.Translation');
goog.require('SpeechBlocks.ValueInput');
goog.require('goog.structs.Map');

/**
 * @param {!SpeechBlocks.Controller} controller The Blockly workspace controller.
 * @constructor
 */
SpeechBlocks.Interpreter = function(controller, blockTypes) {
  /** @private @const */
  this.controller_ = controller;

  // Blocks available on current level.
  /** @private @const */ 
  this.blockTypes_ = blockTypes;

  /** @private {!goog.structs.Map<string, string>} */
  this.blockTypeMap_ = new goog.structs.Map();
  this.blockTypeMap_.set('if', 'controls_if');
  this.blockTypeMap_.set('comparison', 'logic_compare');
  this.blockTypeMap_.set('repeat', 'controls_repeat_ext');
  this.blockTypeMap_.set('number', 'math_number');
  this.blockTypeMap_.set('math', 'math_arithmetic');
  this.blockTypeMap_.set('arithmetic', 'math_arithmetic');
  this.blockTypeMap_.set('text', 'text');
  this.blockTypeMap_.set('print', 'text_print');
  this.blockTypeMap_.set('set', 'variables_set');
  this.blockTypeMap_.set('variable', 'variables_get');
  this.blockTypeMap_.set('turn', 'turtle_turn_internal');
  this.blockTypeMap_.set('move', 'turtle_move');
  this.blockTypeMap_.set('pen', 'turtle_pen');
  this.blockTypeMap_.set('repeat', 'turtle_repeat_internal');
  this.blockTypeMap_.set('color', 'turtle_colour_internal');
}

/**
 * Interprets a given command by calling the corresponding action function.
 * @param {Object} command Command object from parser.
 * @public
 */
SpeechBlocks.Interpreter.prototype.interpret = function(command) {
  // this.controller_.closeMenu()
  switch (command.action) {
    case 'run':
      return this.run_();

    case 'get':
      return this.addBlock_(command);

    case 'connect':
      return this.moveBlock_(command);

    case 'modify':
      return this.modifyBlock_(command);

    case 'delete':
      return this.deleteBlock_(command);

    case 'separate':
      return this.separate_(command);

    case 'undo':
      return this.controller_.undo();

    case 'redo':
      return this.controller_.redo();

    // case 'menu':
    //   return this.menuAction_(command);

    case 'next':
      return this.nextLevel_();

    case 'stay':
      return this.stay_();
  }
};

/**
 * Compiles the Blockly code into JavaScript and runs it.
 * @private
 */
SpeechBlocks.Interpreter.prototype.run_ = function() {
  $('#runButton').click();
  return 'Running the program!';
};

/**
 * Adds a specified block. Can be added to a specific place.
 * @param {Object} command Command object from parser.
 * @private
 */
SpeechBlocks.Interpreter.prototype.addBlock_ = function(command) {
  if (!this.blockTypeMap_.containsKey(command.type)) {
    var msg = 'Block type ' + command.type + ' not available';
    throw new SpeechBlocks.UserError(msg);
  }

  // TODO(ehernandez4): The controller should handle layout management.
  var internalBlockType = this.blockTypeMap_.get(command.type)

  if (!this.blockTypes_.includes(internalBlockType)) {
    var msg = 'Block type \'' + command.type + '\' not available on this level.'
    throw new SpeechBlocks.UserError(msg);
  }

  command.blockId = this.controller_.addBlock(internalBlockType);
  return 'Got a ' + command.type + ' block!';
};

/**
 * Moves a specified block.
 * @param {Object} command Command object from parser.
 * @private
 */
SpeechBlocks.Interpreter.prototype.moveBlock_ = function(command) {
  command.blockId = command.blockId.toString();
  if (!this.isBlockIdValid_(command.blockId)) {
    var msg = 'Block ' + command.blockId.toString() + ' does not exist!';
    throw new SpeechBlocks.UserError(msg);
  }

  // Handle cases where target is a block.
  command.where.blockId = command.where.blockId.toString();
  if (command.where.blockId == null ||
    !this.isBlockIdValid_(command.where.blockId)) {
    var msg = 'Block ' + command.where.blockId + ' does not exist!';
    throw new SpeechBlocks.UserError(msg);
  } else if (command.blockId == command.where.blockId) {
    var msg = 'Sorry, cannot move block ' + command.where.blockId + ' ' + command.where.position 
        + ' itself!';
    throw new SpeechBlocks.UserError(msg);
  }
  var wheres = []
  try {
    wheres = this.getWheres_(command);
  } catch (e) {
    console.log(e);
    var msg = 'Sorry, cannot move block ' + command.where.blockId + ' ' + command.where.position 
        + ' itself!';
    throw new SpeechBlocks.UserError(msg);
  }

  if (wheres.length == 0) {
    var msg = 'Sorry, invalid location.'
    throw new SpeechBlocks.UserError(msg);
  }

  for (var i = 0; i < wheres.length; i++) {
    try {
      this.controller_.moveBlock(command.blockId, wheres[i]);
    } catch (e) {
      console.log(e);
      continue;
    }
    return 'Moved block ' + command.blockId + ' ' + command.where.position + ' ' + command.where.blockId + '!';
  }
};

/**
 * Returns a list of potential wheres.
 */
SpeechBlocks.Interpreter.prototype.getWheres_ = function(command) {
  command.where.blockId = command.where.blockId.toString();
  if (command.where.blockId == null ||
    !this.isBlockIdValid_(command.where.blockId)) {
    var msg = 'Block ' + command.where.blockId + ' does not exist or not given!';
    throw new SpeechBlocks.UserError(msg);
  }

  var wheres = [];
  switch (command.where.position) {
    case 'under':
      wheres.push(new SpeechBlocks.Successor(command.where.blockId));
      break;

    // case 'before':
    //   wheres.push(new SpeechBlocks.Predecessor(command.where.blockId));
    //   break;
    // TODO: Handle this once our levels require "if" blocks.
    // case 'lhs':
    // case 'rhs':
    // case 'top':
    // case 'to the right of':
    //   var inputList = this.controller_.getBlockValueInputs(command.where.blockId);
    //   if (inputList.length == 0) {
    //     throw 'Block ' + command.where.blockId + ' has no value inputs!';
    //   } else if (command.where.position == 'rhs' ||
    //     command.where.position == 'to the right of') {
    //     wheres.push(new SpeechBlocks.ValueInput(command.where.blockId, inputList[inputList.length - 1]));
    //   } else if (command.where.position == 'lhs' ||
    //     command.where.position == 'top') {
    //     wheres.push(new SpeechBlocks.ValueInput(command.where.blockId, inputList[0]));
    //   }
    //   break;

    case 'inside':
      // TODO: We should be handling case-by-case scenarios, where we check if the
      // "where" block has value or statement inputs, as well as if the "to place" block
      // has a previous/output connections.
      var inputList = this.controller_.getBlockValueInputs(command.where.blockId);
      var statementList = this.controller_.getBlockStatementInputs(command.where.blockId);
      for (var i = 0; i < inputList.length; i++) {
        wheres.push(new SpeechBlocks.ValueInput(command.where.blockId, inputList[i]));
      }
      for (var i = 0; i < statementList.length; i++) {
        wheres.push(new SpeechBlocks.StatementInput(command.where.blockId, 
            statementList[statementList.length - 1]));
      }
      break;
  }

  return wheres;
}

/**
 * Modifies a specified block.
 * @param {Object} command Command object from parser.
 * @private
 */
SpeechBlocks.Interpreter.prototype.modifyBlock_ = function(command) {
  command.blockId = command.blockId.toString();
  if (!this.isBlockIdValid_(command.blockId)) {
    var msg = 'Block ' + command.blockId + ' does not exist!';
    throw new SpeechBlocks.UserError(msg);
  }

  // We look for the field the user mentioned
  var fields = this.controller_.getFieldsForBlock(command.blockId).getKeys();
  // Otherwise we try to match by type
  var fieldValuesMap = this.controller_.getFieldValuesForBlock(command.blockId);
  var valueType = typeof (command.new);
  // var fieldIndex;
  var fieldIndex = -1;
  if (valueType == 'string') {
    for (var i = 0; i < fieldValuesMap.keys_.length; i++) {
      if (this.controller_.isFieldValueValid(command.blockId, fieldValuesMap.keys_[i], 
          command.new) && valueType == typeof (fieldValuesMap.get(fieldValuesMap.keys_[i]))) {
        fieldIndex = i;
        break;
      }
    }
  } else if (valueType == 'number') {
    command.new += '';
    for (var i = 0; i < fieldValuesMap.keys_.length; i++) {
      var fieldVal = fieldValuesMap.get(fieldValuesMap.keys_[i]);
      if ((!this.controller_.isFieldValueValid(command.blockId, fieldValuesMap.keys_[i], 
          command.new) || isNaN(parseInt(fieldVal))) && fieldVal != command.original) {
        continue;
      } else if (fieldVal == command.original) {
        fieldIndex = i;
        break;
      }
    }
  }
  if (fieldIndex === -1) {
    var msg = "Sorry, block " + command.blockId + " doesn't have a field with value " + command.original + "!";
    throw new SpeechBlocks.UserError(msg);
  }

  var block = SpeechBlocks.BlockUtils.getBlock(command.blockId, SpeechGames.workspace);
  var value = $("#synonyms synonym[type='" + block.type + "'][field='" + fields[fieldIndex] 
      + "'][alias='" + command.new + "']").attr("property") || command.new;
  var dropdowns = this.getDropdownValues_(block, fields[fieldIndex]);
  if (dropdowns.length > 0) {
    var synonyms = $("#synonyms synonym[type='" + block.type + "'][field='" + fields[fieldIndex] 
        + "']").map(function () { return $(this).attr("alias") }).toArray()
    if (synonyms.length > 0) {
      if (synonyms.indexOf(command.new) < 0) {
        var msg = "Sorry, I didn't understand. You can say " + 
            synonyms.map(function (x) { return "'" + x + "'" }).join(" or ") + " here.";
        throw new SpeechBlocks.UserError(msg);
      }
    } else {
      if (dropdowns.indexOf(String(value)) < 0) {
        var msg = "Sorry, I didn't understand . You can say " 
            + dropdowns.map(function (x) { return "'" + x + "'" }).join(" or ") + " here.";
        throw new SpeechBlocks.UserError(msg);
      }
    }
  }
  this.controller_.setBlockField(command.blockId, fields[fieldIndex], value);
  return 'Changed ' + command.original + ' to ' + command.new + ' in block ' + command.blockId + '!';
};

SpeechBlocks.Interpreter.prototype.getDropdownValues_ = function(block, field) {
  for (var i = 0; i < block.inputList.length; i++) {
    var inputList = block.inputList[i];
    for (var j = 0; j < inputList.fieldRow.length; j++) {
      if (inputList.fieldRow[j].name == field) {
        if (inputList.fieldRow[j] instanceof Blockly.FieldDropdown) {
          return inputList.fieldRow[j].menuGenerator_.map(function (x) { return x[1] });
        } else {
          return [];
        }
      }
    }
  }
  return [];
};

/**
 * Delete the specified block.
 * @param {string} blockId The ID of the block to delete.
 * @private
 */
SpeechBlocks.Interpreter.prototype.deleteBlock_ = function(command) {
  command.blockId = command.blockId.toString();
  if (command.blockId == 'all') {
    this.controller_.removeAllBlocks();
    return 'Deleted all blocks!';
  } else if (this.isBlockIdValid_(command.blockId)) {
    this.controller_.removeBlock(command.blockId);
    return 'Deleted block ' + command.blockId + '!';
  }
};

/**
 * Checks to see if a block Id is valid.
 * @param {string} blockId The (string) ID of the block.
 * @return {boolean} True if the block ID is valid, false otherwise.
 * @private
 */
SpeechBlocks.Interpreter.prototype.isBlockIdValid_ = function(blockId) {
  return this.controller_.getAllBlockIds().contains(blockId);
};

/**
 * Separates the given block from all connected blocks.
 * @param {Object} command Command object from parser.
 * @private
 */
SpeechBlocks.Interpreter.prototype.separate_ = function(command) {
  this.controller_.disconnectBlock(command.blockId);
  return 'Block ' + command.blockId + ' separated!'
}

/**
 * Opens or closes a specified menu.
 * @param {Object} command Command object from parser.
 * @private
 */
// SpeechBlocks.Interpreter.prototype.menuAction_ = function(command) {
//   if (command.actionType == 'open') {
//     this.controller_.openMenu(command.menu);
//     return 'Menu opened!';
//   } else if (command.actionType == 'close') {
//     this.controller_.closeMenu();
//     return 'Menu closed!';
//   }
// };

/**
 * Advances the game to the next level.
 * @private
 */
SpeechBlocks.Interpreter.prototype.nextLevel_ = function() {
  $('#doneOk').click();
  return 'Moving on to the next level!';
}

/**
 * Closes the popup, allowing the user to stay on the current level.
 * @private
 */
SpeechBlocks.Interpreter.prototype.stay_ = function() {
  $("#doneCancel").click();
  return 'Staying on this level!';
}
