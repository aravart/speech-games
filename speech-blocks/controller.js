/**
 * @fileoverview High-level view of a Blockly Workspace that allows
 * for programmatically adding, moving, and deleting blocks. 
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
goog.require('SpeechBlocks.Animator');
goog.require('SpeechBlocks.BlockUtils');
goog.require('SpeechBlocks.FieldTypes');
goog.require('SpeechBlocks.Translation');
goog.require('SpeechBlocks.Where');
goog.require('SpeechBlocks.WorkspaceState');
goog.require('goog.asserts');
goog.require('goog.structs.Map');
goog.require('goog.structs.Set');

/**
 * @param {!Blockly.Workspace} workspace The current workspace.
 * @param {boolean} useAnimation If true, the controller will animate
 *    all actions it performs on the workspace.
 * @constructor
 */
SpeechBlocks.Controller = function(workspace, useAnimation) {
  /** @private @const {!Blockly.Workspace} */
  this.workspace_ = workspace;

  /** @private @const */
  this.layout_ = new SpeechBlocks.Layout(workspace);

  /** @private @const {?SpeechBlocks.Animator} */
  this.animator_ = useAnimation ? new SpeechBlocks.Animator() : undefined;

  /** @private {!SpeechBlocks.WorkspaceState} */
  this.workspaceState_ = SpeechBlocks.WorkspaceState.stateOf(this.workspace_);

  /** @private {!Array<!Function>} */
  this.stateChangeListeners_ = [];

  /** @private */
  this.lastBlockId_ = 0;

  // Override the newBlock function to use our default IDs.
  var nextId = function() { return (++this.lastBlockId_).toString(); }.bind(this);
  var newBlockOld = this.workspace_.newBlock.bind(this.workspace_);
  this.workspace_.newBlock = function(prototypeName) {
    return newBlockOld(prototypeName, nextId());
  };

  // Listen for create events and tag the block with its ID.
  this.workspace_.addChangeListener(function(event) {
    if (event.type != Blockly.Events.CREATE) {
      return;
    }
    var newBlock =
        SpeechBlocks.BlockUtils.getBlock(event.blockId, this.workspace_);
    newBlock.appendDummyInput().appendField(
        new Blockly.FieldLabel(
            'Block ' + newBlock.id,
            'block-id-style block' + newBlock.id)); // Append block ID as CSS class.
  }.bind(this));

  // For any other event, update the workspace state.
  this.workspace_.addChangeListener(function(event) {
    var state = SpeechBlocks.WorkspaceState.stateOf(this.workspace_);
    if (!this.workspaceState_.equals(state)) {
      this.workspaceState_ = state;
      this.stateChangeListeners_.forEach(function(listener) {
        listener(this.workspaceState_);
      }.bind(this));
    }
  }.bind(this));

  // TODO(ehernandez4): Remove access to private fields.
  /** @private @const {!goog.structs.Map<string, !Element>} */
  this.blockXmlMap_ = new goog.structs.Map();
  
  // Initialize the map of block definitions.
  if (this.workspace_.options.hasCategories) {
    this.workspace_.toolbox_.tree_.forEachChild(function(blockTab) {
      blockTab.blocks.forEach(function(block) {
        this.blockXmlMap_.set(block.getAttribute('type'), block);
      }, this)
    }, this);
  } else {
    var arr = this.workspace_.options.languageTree.children;
    for (var i = 0, len = arr.length; i < len; i++) {
      this.blockXmlMap_.set(arr[i].getAttribute('type'), arr[i]);
    }
  }
};

/**
 * Adds and renders a new block to the workspace.
 * @param {string} type Name of the language object containing
 *     type-specific functions for this block.
 * @return {string} ID of the newly created block.
 * @public
 */
SpeechBlocks.Controller.prototype.addBlock = function(type) {
  var coordsForBlock = this.layout_.getPositionForNewBlock()
  
  if (!this.animator_) {
    var newBlock = Blockly.Xml.domToBlock(
        this.blockXmlMap_.get(type).cloneNode(true),
        this.workspace_);
    this.moveBlock(
        newBlock.id,
        new SpeechBlocks.Translation(coordsForBlock.x, coordsForBlock.y));
    return newBlock.id;
  }
  
  var newBlockId;
  this.animator_.animateBlockCreation(
      type,
      coordsForBlock,
      function() { 
        newBlockId = this.lastBlockId_.toString();
        SpeechBlocks.BlockUtils.getBlock(newBlockId, this.workspace_).unselect();
      }.bind(this));
  return newBlockId;
};

/**
 * Moves the block with the given ID. All child blocks are moved as well.
 * @param {string} blockId ID of the block to move.
 * @param {!SpeechBlocks.Where} where Location on the workspace
 *    to place the new block.
 * @public
 */
SpeechBlocks.Controller.prototype.moveBlock = function(blockId, where) {
  where.place(blockId, this.workspace_, this.animator_);
};

/**
 * Disconnects the block from it superior (parent) block.
 * @param {string} blockId ID of the block to disconnect.
 * @public
 */
SpeechBlocks.Controller.prototype.disconnectBlock = function(blockId) {
  var block = SpeechBlocks.BlockUtils.getBlock(blockId, this.workspace_);
  this.moveBlock(blockId, new SpeechBlocks.Translation(block.width + 20, 0));
};

/**
 * Removes the block with the given ID from the workspace, along with its children.
 * @param {string} blockId ID of the block to remove.
 * @public
 */
SpeechBlocks.Controller.prototype.removeBlock = function(blockId) {
  var block = SpeechBlocks.BlockUtils.getBlock(blockId, this.workspace_);
  if (!this.animator_) {
    block.dispose();
    return;
  }
  this.animator_.animateTranslation(
      blockId, /* dx */ -block.getRelativeToSurfaceXY().x - 100, /* dy */ 0);
};

/**
 * Removes all blocks from the workspace. No animation involved.
 * @public
 */
SpeechBlocks.Controller.prototype.removeAllBlocks = function() {
  this.workspace_.clear();
  this.lastBlockId_ = 0;
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
      SpeechBlocks.BlockUtils.getBlock(blockId, this.workspace_).nextConnection);
};

/**
 * Checks whether the block with the given ID has a "previous block" connection.
 * @param {string} blockId ID of the block.
 * @return {boolean} True if block has previous connection, false otherwise.
 * @public
 */
SpeechBlocks.Controller.prototype.hasPreviousConnection = function(blockId) {
  return !goog.isNull(
      SpeechBlocks.BlockUtils.getBlock(blockId, this.workspace_).previousConnection);
};

/**
 * Checks whether the block with the given ID has a value output connection.
 * @param {string} blockId ID of the block.
 * @return {boolean} True if block has output connection, false otherwise.
 * @public
 */
SpeechBlocks.Controller.prototype.hasOutputConnection = function(blockId) {
  return !goog.isNull(
      SpeechBlocks.BlockUtils.getBlock(blockId, this.workspace_).outputConnection);
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
  SpeechBlocks.BlockUtils.getBlock(blockId, this.workspace_).inputList.forEach(function(input) {
    if (input.type == type) { 
      inputLabels.push(input.name); 
    }
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
  /** @type {!goog.structs.Map<string, number>} */
  var blockFields = new goog.structs.Map();
  SpeechBlocks.BlockUtils.getBlock(blockId, this.workspace_).inputList.forEach(function(input) {
    input.fieldRow.forEach(function(field) {
      var type = SpeechBlocks.FieldTypes.typeOf(field);
      if (field.name && type != SpeechBlocks.FieldTypes.IRRELEVANT) {
        blockFields.set(field.name, type);
      }
    });
  });
  return blockFields;
};

/**
 * Returns a mapping from field names to current values.
 * @param {string} blockId The ID of the block.
 * @return {!goog.structs.Map<string, string>} A mapping of field names to values.
 * @public
 */
SpeechBlocks.Controller.prototype.getFieldValuesForBlock = function(blockId) {
  /** @type {!goog.structs.Map<string, string>} */
  var blockFieldValues = new goog.structs.Map();
  SpeechBlocks.BlockUtils.getBlock(blockId, this.workspace_).inputList.forEach(function(input) {
    input.fieldRow.forEach(function(field) {
      var type = SpeechBlocks.FieldTypes.typeOf(field)
      if (field.name && type != SpeechBlocks.IRRELEVANT) {
        blockFieldValues.set(field.name, field.getValue());
      }
    });
  });
  return blockFieldValues;
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
  SpeechBlocks.BlockUtils.getBlock(blockId, this.workspace_).setFieldValue(fieldValue, fieldName);
};

/**
 * Checks that the given value is valid for the given field.
 * @param {string} blockId The ID of the block.
 * @param {string} fieldName The name of the field to validate.
 * @param {string} value The value to validate.
 * @return {boolean} True if given value is valid; false otherwise.
 * @public
 */
SpeechBlocks.Controller.prototype.isFieldValueValid = function(blockId, fieldName, value) {
  return !goog.isNull(this.getField_(blockId, fieldName).callValidator(value));
};

/**
 * Asserts that the field with the given name exists and returns it.
 * @param {string} blockId The ID of the block.
 * @param {string} fieldName The name of the field.
 * @return {!Blockly.Field} Field with given name in given block.
 * @public
 */
SpeechBlocks.Controller.prototype.getField_ = function(blockId, fieldName) {
  return goog.asserts.assertInstanceof(
      SpeechBlocks.BlockUtils.getBlock(blockId, this.workspace_)).getField(fieldName);
};

/**
 * Add a listener to be fired everytime the workspace state changes.
 * @param {Function} listener The listener to add.
 * @public
 */
SpeechBlocks.Controller.prototype.addStateChangeListener = function(listener) {
  this.stateChangeListeners_.push(listener);
};

/**
 * Open the specified toolbox menu.
 * @param {string} menuName Name of the menu to open.
 * @public
 */
// SpeechBlocks.Controller.prototype.openMenu = function(menuName) {
//   var menus = this.workspace_.toolbox_.tree_.children_;
//   for (var i = 0; i < menus.length; i++) {
//     if (menus[i].getText().toLowerCase() == menuName) {
//       menus[i].onMouseDown();
//       return;
//     }
//   }
//   throw 'Menu not found';
// }

/**
 * Close any open toolbox menus.
 * @public
 */
// SpeechBlocks.Controller.prototype.closeMenu = function() {
//   if (this.workspace_.options.hasCategories) {
//     this.workspace_.toolbox_.clearSelection()
//   }
// }
