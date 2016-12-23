/**
 * @fileoverview Interprets a given command and calls workspace controller_.functions.
 * @author david.liang@wisc.edu (David Liang)
 * @author pandori@wisc.edu (Sahib Pandori)
 */
'use strict';

goog.provide('SpeechBlocks.Interpreter');

goog.require('SpeechBlocks.Predecessor');
goog.require('SpeechBlocks.StatementInput')
goog.require('SpeechBlocks.Successor');
goog.require('SpeechBlocks.Translation');
goog.require('SpeechBlocks.ValueInput');
goog.require('goog.structs.Map');

/**
 * Constructs an interpreter that takes actions as input and controls the Blockly Workspace.
 * @param {!SpeechBlocks.Controller} controller The Blockly Workspace controller.
 * @constructor
 */
SpeechBlocks.Interpreter = function(controller) {
  /** @private @const */
  this.controller_ = controller;

  /** @private {!goog.structs.Map<string, string>} */
  this.blockTypeMap_ = new goog.structs.Map();
  this.createBlockTypeMap_();

  /** @private {!Array<string>} */
  this.blockTypes_ = controller.blockXmlMap_.keys_.slice()
}

/** @private */
SpeechBlocks.Interpreter.prototype.createBlockTypeMap_ = function() {
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
  this.blockTypeMap_.set('move', 'turtle_move_internal');
  this.blockTypeMap_.set('pen', 'turtle_pen');
  this.blockTypeMap_.set('repeat', 'turtle_repeat_internal');
  this.blockTypeMap_.set('color', 'turtle_colour_internal');
  this.blockTypeMap_.set('walk', 'turtle_walk');
}

/**
 * Interprets a given command by calling the corresponding action function.
 * @param {Object} command Command object from parser.
 * @public
 */
SpeechBlocks.Interpreter.prototype.interpret = function(command) {
  this.controller_.closeMenu()
  switch (command.action) {
    case 'run':
      this.run_();
      break;

    case 'add':
      try {
        this.addBlock_(command);
      } catch (e) {
        console.log(e);
      } finally {
        break;
      }

    case 'move':
      try {
        this.moveBlock_(command);
      } catch (e) {
        console.log(e);
      } finally {
        break;
      }

    case 'modify':
      try {
        this.modifyBlock_(command);
      } catch (e) {
        console.log(e);
      } finally {
        break;
      }

    case 'delete':
      this.deleteBlock_(command.block.toString());
      break;

    case 'undo':
      this.controller_.undo();
      break;

    case 'redo':
      this.controller_.redo();
      break;

    case 'menu':
      if (command.actionType == 'open') {
        this.controller_.openMenu(command.menu);
      } else if (command.actionType == 'close'){
        this.controller_.closeMenu();
      }
      break;
  }
};

/**
 * Compiles the Blockly code into JavaScript and runs it.
 * @private
 */
SpeechBlocks.Interpreter.prototype.run_ = function() {
  document.getElementById('runButton').click();
};

/**
 * Adds a specified block. Can be added to aspecific place.
 * @param {Object} command Command object from parser.
 * @private
 */
SpeechBlocks.Interpreter.prototype.addBlock_ = function(command) {
  if (!this.blockTypes_.includes(this.blockTypeMap_.get(command.type))) {
    throw 'Block type ' + this.blockTypes_.toString() + 'not available';
  }
  // An empty where means the user did not specify a location
  // And we place the block in some empty region of the canvas
  if(command.where == "") {
    command.block = this.controller_.addBlock(
      this.blockTypeMap_.get(command.type),
      this.getNewPosition_());
  } else {
    // TODO Revise this code not to use exceptions as control flow
    command.block = this.controller_.addBlock(this.blockTypeMap_.get(command.type));
    var wheres = []
    try {
      wheres = this.getWheres_(command);
    } catch (e) {
      console.log(e);
      return;
    }
    for (var i = 0; i < wheres.length; i++) {
      try {
        this.controller_.moveBlock(command.block, wheres[i]);
      } catch (e) {
        console.log(e);
        continue;
      }
      break;
    }
  }
};

/**
 * Returns coordinates of some empty space in the workspace
 * @private
 */
SpeechBlocks.Interpreter.prototype.getNewPosition_ = function(command) {
  var blocks = SpeechGames.workspace.getAllBlocks();
  if(blocks.length == 0) {
    return new SpeechBlocks.Translation(10,10);
  }
  var maxy = 0;
  for(var i = 0; i < blocks.length; i++) {
    maxy = Math.max(maxy, blocks[i].getRelativeToSurfaceXY().y + blocks[i].height);
  }
  // If you use fewer than 20, Blockly shifts it rightward a bit because there is a zone under the block where it'd be connected
  return new SpeechBlocks.Translation(10, maxy + 20);
}

/**
 * Moves a specified block.
 * @param {Object} command Command object from parser.
 * @private
 */
SpeechBlocks.Interpreter.prototype.moveBlock_ = function(command) {
  command.block = command.block.toString();
  // console.log(command)
  if (!this.isBlockIdValid_(command.block)) {
    throw 'Block ' + command.block.toString() + ' does not exist!';
  }

  // Handle cases where target is not a block.
  if (command.where == 'trash') {
    this.deleteBlock_(command.block);
    return;
  } else if (command.where == 'away') {
    this.controller_.disconnectBlock(command.block);
    return;
  }

  // Handle cases where target is a block.
  command.where.block = command.where.block.toString();
  if (command.where.block == null ||
    !this.isBlockIdValid_(command.where.block)) {
    throw 'Block ' + command.where.block + ' does not exist!';
  }
  var wheres = []
  try {
    wheres = this.getWheres_(command);
  } catch (e) {
    console.log(e);
    return;
  }
  for (var i = 0; i < wheres.length; i++) {
    try {
      this.controller_.moveBlock(command.block, wheres[i]);
    } catch (e) {
      console.log(e);
      continue;
    }
    break;
  }
};

/**
 * Returns a list of potential wheres.
 */
SpeechBlocks.Interpreter.prototype.getWheres_ = function(command) {
  command.where.block = command.where.block.toString();
  if (command.where.block == null ||
    !this.isBlockIdValid_(command.where.block)) {
    throw 'Block ' + command.where.block + ' does not exist or not given!';
  }

  var wheres = [];
  switch (command.where.position) {
    case 'below':
      wheres.push(new SpeechBlocks.Successor(command.where.block));
      break;

    case 'above':
      wheres.push(new SpeechBlocks.Predecessor(command.where.block));
      break;

    case 'lhs':
    case 'rhs':
    case 'top':
    case 'to the right of':
      var inputList = this.controller_.getBlockValueInputs(command.where.block);
      if (inputList.length == 0) {
        throw 'Block ' + command.where.block + ' has no value inputs!';
      } else if (command.where.position == 'rhs' ||
        command.where.position == 'to the right of') {
        wheres.push(new SpeechBlocks.ValueInput(command.where.block, inputList[inputList.length - 1]));
      } else if (command.where.position == 'lhs' ||
        command.where.position == 'top') {
        wheres.push(new SpeechBlocks.ValueInput(command.where.block, inputList[0]));
      }
      break;

    case 'inside':
      // TODO: We should be handling case-by-case scenarios, where we check if the
      // "where" block has value or statement inputs, as well as if the "to place" block
      // has a previous/output connections.
      var inputList = this.controller_.getBlockValueInputs(command.where.block);
      var statementList = this.controller_.getBlockStatementInputs(command.where.block);
      for (var i = 0; i < inputList.length; i++) {
        wheres.push(new SpeechBlocks.ValueInput(command.where.block, inputList[i]));
      }
      for (var i = 0; i < statementList.length; i++) {
        wheres.push(new SpeechBlocks.StatementInput(command.where.block, statementList[statementList.length - 1]));
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
  command.block = command.block.toString();
  if (!this.isBlockIdValid_(command.block)) {
    throw 'Block ' + command.block + ' does not exist!';
  }

  var fields = this.controller_.getFieldsForBlock(command.block).getKeys();
  var fieldIndex;
  if (command.ordinal) {
    switch (command.ordinal) {
      case 'first':
        fieldIndex = 0;
        break;
      case 'second':
        fieldIndex = 1;
        break;
      case 'third':
        fieldIndex = 2;
        break;
      case 'fourth':
        fieldIndex = 3;
        break;
    }
  } else {
    var fieldValuesMap = this.controller_.getFieldValuesForBlock(command.block);
    var valueType = typeof(command.value);
    if (valueType == "string") {
      for (var i = 0; i < fieldValuesMap.keys_.length; i++) {
        if (this.controller_.isFieldValueValid(command.block, fieldValuesMap.keys_[i], command.value) && valueType == typeof(fieldValuesMap.get(fieldValuesMap.keys_[i]))) {
          fieldIndex = i;
          break;
        }
      }
    } else if (valueType == "number") {
      command.value += "";
      for (var i = 0; i < fieldValuesMap.keys_.length; i++) {
        if (!this.controller_.isFieldValueValid(command.block, fieldValuesMap.keys_[i], command.value) || isNaN(parseInt(fieldValuesMap.get(fieldValuesMap.keys_[i])))) {
          continue;
        } else {
          fieldIndex = i;
          break;
        }
      }
    }
    if (!fieldIndex) {
      console.log("Couldn't determine which field to modify");
      return;
    }
  }
  this.controller_.setBlockField(command.block, fields[fieldIndex], command.value);
};

/**
 * Delete a specified block.
 * @param {string} command Command object from parser.
 * @private
 */
SpeechBlocks.Interpreter.prototype.deleteBlock_ = function(blockId) {
  if (blockId == 'all') {
    this.controller_.removeAllBlocks();
  } else if (this.isBlockIdValid_(blockId)) {
    this.controller_.removeBlock(blockId);
  }
};

/**
 * Checks to see if a block Id is valid.
 * @param {string} blockId as string.
 * @private
 */
SpeechBlocks.Interpreter.prototype.isBlockIdValid_ = function(blockId) {
  return this.controller_.getAllBlockIds().contains(blockId);
}
