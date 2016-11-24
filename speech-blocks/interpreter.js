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
  this.blockTypes_ = [];
  this.retrieveBlockTypes_();
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
}

/** @private */
SpeechBlocks.Interpreter.prototype.retrieveBlockTypes_ = function() {
  var children = document.getElementById('toolbox').children;
  for (var i = 0; i < children.length; i++) {
    for (var j = 0; j < children[i].children.length; j++) {
      this.blockTypes_.push(children[i].children[j].getAttribute('type'));
    }
  }
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
      this.addBlock_(command);
      break;

    case 'move':
      this.moveBlock_(command);
      break;

    case 'modify':
      this.modifyBlock_(command);
      break;

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
      } else {
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
    throw 'Block not available';
  }

  // TODO: Rather than calling add followed by move, we should create the Where object
  // here and then pass that object to addBlock.
  command.block = this.controller_.addBlock(this.blockTypeMap_.get(command.type));
  if (command.where != null) {
    this.moveBlock_(command);
  }
};

/**
 * Moves a specified block.
 * @param {Object} command Command object from parser.
 * @private
 */
SpeechBlocks.Interpreter.prototype.moveBlock_ = function(command) {
  command.block = command.block.toString();
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
  if (command.where.block == null
      || !this.isBlockIdValid_(command.where.block)) {
    throw 'Block ' + command.where.block + ' does not exist!';
  }

  switch (command.where.position) {
    case 'below':
      this.controller_.moveBlock(command.block, new SpeechBlocks.Successor(command.where.block));
      break;

    case 'above':
      this.controller_.moveBlock(command.block, new SpeechBlocks.Predecessor(command.where.block));
      break;

    case 'lhs':
    case 'rhs':
    case 'top':
    case 'to the right of':
      var inputList = this.controller_.getBlockValueInputs(command.where.block);
      if (inputList.length == 0) {
        throw 'Block ' + command.where.block + ' has no value inputs!';
      } else if (command.where.position == 'rhs'
          || command.where.position == 'to the right of') {
        this.controller_.moveBlock(
            command.block,
            new SpeechBlocks.ValueInput(command.where.block, inputList[inputList.length - 1]));
      } else if (command.where.position == 'lhs' || command.where.position == 'top') {
        this.controller_.moveBlock(
            command.block,
            new SpeechBlocks.ValueInput(command.where.block, inputList[0]));
      }
      break;

    case 'inside':
      var inputList = this.controller_.getBlockValueInputs(command.where.block);
      var statementList = this.controller_.getBlockStatementInputs(command.where.block);

      // TODO: We should be handling case-by-case scenarios, where we check if the
      // "where" block has value or statement inputs, as well as if the "to place" block
      // has a previous/output connections.
      try {
        this.controller_.moveBlock(
            command.block, new SpeechBlocks.ValueInput(command.where.block, inputList[0]));
      } catch (err) {
        console.log(err);
      }

      try {
        this.controller_.moveBlock(
            command.block,
            new SpeechBlocks.StatementInput(
                command.where.block, statementList[statementList.length - 1]));
      } catch (err) {
        console.log(err);
      }
      break;

    case 'away':
      this.controller_.disconnectBlock(command.block);
      break;
  }
};

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
  var fieldIndex = fields.length - 1;

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

  // TODO: Is this switch statement necessary?
  switch (command.property) {
    case 'number':
      command.value = Number(command.value); // fall through
    case 'text':
    case 'comparison':
    case 'operation':
    case 'name':
    case 'value':
    case 'field':
      try {
        this.controller_.setBlockField(command.block, fields[fieldIndex], command.value);
      } catch (e) {
        this.controller_.setBlockField(command.block, fields[fields.length - 1], command.value);
      }
      break;
  }
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
