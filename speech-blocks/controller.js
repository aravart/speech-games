/**
 * @fileoverview High-level view of a Blockly Workspace that allows
 * for programmatically adding, moving, and deleting blocks. Does NOT
 * provide error checking.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.Controller');

goog.require('Blockly.Events');
goog.require('Blockly.Field');
goog.require('Blockly.FieldAngle');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldNumber');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.FieldVariable');
goog.require('Blockly.JavaScript');
goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');
goog.require('Blockly.constants');
goog.require('Blockly.inject');
goog.require('SpeechBlocks.Blocks');
goog.require('SpeechBlocks.FieldTypes');
goog.require('SpeechBlocks.Translation');
goog.require('SpeechBlocks.Where');
goog.require('goog.asserts');
goog.require('goog.structs.Map');
goog.require('goog.structs.Set');

/**
 * @param {!Blockly.Workspace} workspace
 * @private
 * @constructor
 */
SpeechBlocks.Controller = function(workspace) {
  /** @private @const {!Blockly.Workspace} */
  this.workspace_ = workspace;

  // Listen for create events and tag the block with its ID.
  this.workspace_.addChangeListener(function(event) {
    if (event.type == Blockly.Events.CREATE) {
      var newBlock =
          SpeechBlocks.Blocks.getBlock(event.blockId, this.workspace_);
      newBlock.appendDummyInput().appendField('(' + newBlock.id + ')');
    }
  }.bind(this));
};

/**
 * Injects Blockly into the given container using the given options, and returns
 * the corresponding SpeechBlocks controller.
 * @param {!Element|string} container Containing element, or its ID, or a CSS selector.
 * @param {Object=} opt_options Optional dictionary of options.
 * @return {!SpeechBlocks.Controller} Controller for the Blockly workspace.
 * @public
 */
SpeechBlocks.Controller.injectIntoDiv = function(container, opt_options) {
  return new SpeechBlocks.Controller(Blockly.inject(container, opt_options));
};

/**
 * Parses the headless XML into a Blockly workspace and returns
 * a corresponding SpeechBlocks controller.
 * @param {!Element} xml XML element to convert to workspace.
 * @return {!SpeechBlocks.Controller} Controller for the Blockly workspace.
 * @public
 */
SpeechBlocks.Controller.constructFromXml = function(xml) {
  return new SpeechBlocks.Controller(
      Blockly.Xml.domToWorkspace(xml, new Blockly.Workspace()));
};

/**
 * Adds and renders a new block to the workspace.
 * @param {string} type Name of the language object containing
 *     type-specific functions for this block.
 * @param {string} blockId ID for the block.
 * @param {SpeechBlocks.Where=} opt_where Optional location on the
 *     workspace to place the new block.
 * @public
 */
SpeechBlocks.Controller.prototype.addBlock = function(type, blockId, opt_where  ) {
  var newBlock = this.workspace_.newBlock(type, blockId);
  newBlock.initSvg();
  if (opt_where) {
    this.moveBlock(blockId, goog.asserts.assertInstanceof(opt_where, SpeechBlocks.Where));
  } else {
    this.workspace_.render();
  }
};

/**
 * Moves the block with the given ID. All child blocks are moved as well.
 * @param {string} blockId ID of the block to move.
 * @param {!SpeechBlocks.Where} where Location on the workspace
 *    to place the new block.
 * @public
 */
SpeechBlocks.Controller.prototype.moveBlock = function(blockId, where) {
  where.place(blockId, this.workspace_);
  this.workspace_.render();
};

/**
 * Disconnects the block from it superior (parent) block.
 * @param {string} blockId ID of the block to disconnect.
 * @public
 */
SpeechBlocks.Controller.prototype.disconnectBlock = function(blockId) {
  SpeechBlocks.Blocks.getBlock(blockId, this.workspace_).unplug(true /* Heal stack! */);
  this.moveBlock(blockId, new SpeechBlocks.Translation(50, 0));
};

/**
 * Removes the block with the given ID from the workspace, along with its children.
 * @param {string} blockId ID of the block to remove.
 * @public
 */
SpeechBlocks.Controller.prototype.removeBlock = function(blockId) {
  var block = SpeechBlocks.Blocks.getBlock(blockId, this.workspace_);
  block.unplug(true /* Heal the stack! */);
  block.dispose();
};

/**
 * Removes all blocks from the workspace.
 * @public
 */
 SpeechBlocks.Controller.prototype.removeAllBlocks = function() {
   this.workspace_.clear();
 };

/**
 * Undos the last action.
 * @public
 */
SpeechBlocks.Controller.prototype.undo = function() { this.workspace_.undo(false); };

/**
 * Redos the last undo.
 * @public
 */
SpeechBlocks.Controller.prototype.redo = function() { this.workspace_.undo(true); };

/**
 * Transpiles the workspace into JavaScript code and evaluates it.
 * @throws {Exception} if the code fails to run.
 * @public
 */
SpeechBlocks.Controller.prototype.run = function() {
  Blockly.JavaScript.addReservedWords('code');
  eval(Blockly.JavaScript.workspaceToCode(this.workspace_));
};

/**
 * Returns the set of IDs for all blocks in the workspace.
 * @return {!goog.structs.Set<string>} The array of all IDs.
 * @public
 */
SpeechBlocks.Controller.prototype.getAllBlockIds = function() {
  var blockIds = new goog.structs.Set();
  this.workspace_.getAllBlocks().forEach(function(block) {
    blockIds.add(block.id);
  });
  return blockIds;
};

/**
 * Checks whether the block with the given ID has a "next block" connection.
 * @param {string} blockId ID of the block.
 * @return {boolean} True if block has next connection, false otherwise.
 * @public
 */
SpeechBlocks.Controller.prototype.hasNextConnection = function(blockId) {
  return !goog.isNull(
      SpeechBlocks.Blocks.getBlock(blockId, this.workspace_).nextConnection);
};

/**
 * Checks whether the block with the given ID has a "previous block" connection.
 * @param {string} blockId ID of the block.
 * @return {boolean} True if block has previous connection, false otherwise.
 * @public
 */
SpeechBlocks.Controller.prototype.hasPreviousConnection = function(blockId) {
  return !goog.isNull(
      SpeechBlocks.Blocks.getBlock(blockId, this.workspace_).previousConnection);
};

/**
 * Checks whether the block with the given ID has a value output connection.
 * @param {string} blockId ID of the block.
 * @return {boolean} True if block has output connection, false otherwise.
 * @public
 */
SpeechBlocks.Controller.prototype.hasOutputConnection = function(blockId) {
  return !goog.isNull(
      SpeechBlocks.Blocks.getBlock(blockId, this.workspace_).outputConnection);
};

/**
 * Returns the list of value input labels for this block.
 * Returns a list of value input labels for the block.
 * @param {string} blockId ID of the block.
 * @return {!Array<string>} List of value input labels for this block.
 * @public
 */
SpeechBlocks.Controller.prototype.getBlockValueInputs = function(blockId) {
  return this.getBlockXInputs_(blockId, Blockly.INPUT_VALUE);
};

/**
 * Returns the list of statement input labels for the block.
 * @param {string} blockId ID of the block.
 * @return {!Array<string>} List of statement input labels for this block.
 * @public
 */
SpeechBlocks.Controller.prototype.getBlockStatementInputs = function(blockId) {
  // Eventually, we might also want to include Blockly.PREVIOUS_STATEMENT
  // input types, but it's not clear where this is used.
  return this.getBlockXInputs_(blockId, Blockly.NEXT_STATEMENT);
};

/**
 * Gets the labels for inputs of the given type from the given block.
 * @param {string} blockId ID of the block.
 * @param {number} type Input type to get.
 * @return {!Array<string>} Array of input labels of the given type.
 * @private
 */
SpeechBlocks.Controller.prototype.getBlockXInputs_ = function (blockId, type) {
  var inputLabels = [];
  SpeechBlocks.Blocks.getBlock(blockId, this.workspace_).inputList.forEach(function(input) {
    if (input.type == type) { inputLabels.push(input.name); }
  });
  return inputLabels;
};

/**
 * Returns a mapping from field names to field types for the given block.
 * Note that all field types are enumerated in SpeechBlocks.FieldTypes.
 * @param {string} blockId The ID of the block.
 * @return {!goog.structs.Map<string, number>} A mapping of field names to field types.
 * @public
 */
SpeechBlocks.Controller.prototype.getFieldsForBlock = function(blockId) {
  var blockFields = new goog.structs.Map();
  SpeechBlocks.Blocks.getBlock(blockId, this.workspace_).inputList.forEach(function(input) {
    input.fieldRow.forEach(function(field) {
      var type = SpeechBlocks.Controller.getFieldType_(field);
      if (field.name && type != SpeechBlocks.FieldTypes.IRRELEVANT) {
        blockFields.set(field.name, type);
      }
    });
  });
  return blockFields;
};

/**
 * Returns the corresponding type enum for the given field.
 * @param {!Blockly.Field} field Field to get type for.
 * @return {number} Enum value for field type.
 * @private
 */
SpeechBlocks.Controller.getFieldType_ = function(field) {
  if (field instanceof Blockly.FieldTextInput) {
    return SpeechBlocks.FieldTypes.TEXT_INPUT;
  } else if (field instanceof Blockly.FieldNumber) {
    return SpeechBlocks.FieldTypes.NUMBER_INPUT;
  } else if (field instanceof Blockly.FieldAngle) {
    return SpeechBlocks.FieldTypes.ANGLE_PICKER;
  } else if (field instanceof Blockly.FieldColour) {
    return SpeechBlocks.FieldTypes.COLOUR_PICKER;
  } else if (field instanceof Blockly.FieldVariable) {
    return SpeechBlocks.FieldTypes.VARIABLE_PICKER;
  } else if (field instanceof Blockly.FieldDropdown) {
    return SpeechBlocks.FieldTypes.DROP_DOWN;
  } else {
    return SpeechBlocks.FieldTypes.IRRELEVANT;
  }
};

/**
 * Sets the field with the given name to the given value.
 *
 * Formatting of the value is very important:
 *
 * _______________________________________
 * FIELD TYPE         | VALUE FORMAT
 * ___________________|___________________
 * Text Input         | '*' (any text)
 * Number Input       | '[0-9]+' (any number)
 * Drop-Down          | existing drop-down value
 * Date Picker        | 'yyyy-mm-dd'
 * Angle Picker       | 'x' where 0 <= x <= 360
 * Colour Picker      | '#HHH' where H is a hex digit
 * Variable Picker    | existing variable name
 *
 * @param {string} blockId ID of the block.
 * @param {string} fieldName Name of the field.
 * @param {string} fieldValue New value for the field.
 * @public
 */
SpeechBlocks.Controller.prototype.setBlockField = function(blockId, fieldName, fieldValue) {
  SpeechBlocks.Blocks.getBlock(blockId, this.workspace_).setFieldValue(fieldValue, fieldName);
};
