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
    this.blockTypeMap_.set('move', 'turtle_move');
    this.blockTypeMap_.set('pen', 'turtle_pen');
    this.blockTypeMap_.set('repeat', 'turtle_repeat_internal');
    this.blockTypeMap_.set('color', 'turtle_colour_internal');
    this.blockTypeMap_.set('step', 'turtle_step');
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
            this.deleteBlock_(command.blockId.toString());
            break;

        case 'undo':
            this.controller_.undo();
            break;

        case 'redo':
            this.controller_.redo();
            break;

        case 'menu':
            this.menuAction_(command);
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

    command.blockId = this.controller_.addBlock(
        this.blockTypeMap_.get(command.type),
        this.controller_.layout.getNewPosition_());
};

/**
 * Moves a specified block.
 * @param {Object} command Command object from parser.
 * @private
 */
SpeechBlocks.Interpreter.prototype.moveBlock_ = function(command) {
    command.blockId = command.blockId.toString();
    if (!this.isBlockIdValid_(command.blockId)) {
        throw 'Block ' + command.blockId.toString() + ' does not exist!';
    }

    // Handle cases where target is not a block.
    if (command.where == 'trash') {
        this.deleteBlock_(command.blockId);
        return;
    } else if (command.where == 'away') {
        this.controller_.disconnectBlock(command.blockId);
        return;
    }

    // Handle cases where target is a block.
    command.where.blockId = command.where.blockId.toString();
    if (command.where.blockId == null ||
        !this.isBlockIdValid_(command.where.blockId)) {
        throw 'Block ' + command.where.blockId + ' does not exist!';
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
            this.controller_.moveBlock(command.blockId, wheres[i]);
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
    command.where.blockId = command.where.blockId.toString();
    if (command.where.blockId == null ||
        !this.isBlockIdValid_(command.where.blockId)) {
        throw 'Block ' + command.where.blockId + ' does not exist or not given!';
    }

    var wheres = [];
    switch (command.where.position) {
        case 'below':
            wheres.push(new SpeechBlocks.Successor(command.where.blockId));
            break;

        case 'above':
            wheres.push(new SpeechBlocks.Predecessor(command.where.blockId));
            break;

        case 'lhs':
        case 'rhs':
        case 'top':
        case 'to the right of':
            var inputList = this.controller_.getBlockValueInputs(command.where.blockId);
            if (inputList.length == 0) {
                throw 'Block ' + command.where.blockId + ' has no value inputs!';
            } else if (command.where.position == 'rhs' ||
                command.where.position == 'to the right of') {
                wheres.push(new SpeechBlocks.ValueInput(command.where.blockId, inputList[inputList.length - 1]));
            } else if (command.where.position == 'lhs' ||
                command.where.position == 'top') {
                wheres.push(new SpeechBlocks.ValueInput(command.where.blockId, inputList[0]));
            }
            break;

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
                wheres.push(new SpeechBlocks.StatementInput(command.where.blockId, statementList[statementList.length - 1]));
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
        throw 'Block ' + command.blockId + ' does not exist!';
    }

    // We look for the field the user mentioned
    var fields = this.controller_.getFieldsForBlock(command.blockId).getKeys();
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
        }
    } else {
        // Otherwise we try to match by type
        var fieldValuesMap = this.controller_.getFieldValuesForBlock(command.blockId);
        var valueType = typeof(command.value);
        if (valueType == "string") {
            for (var i = 0; i < fieldValuesMap.keys_.length; i++) {
                if (this.controller_.isFieldValueValid(command.blockId, fieldValuesMap.keys_[i], command.value) && valueType == typeof(fieldValuesMap.get(fieldValuesMap.keys_[i]))) {
                    fieldIndex = i;
                    break;
                }
            }
        } else if (valueType == "number") {
            command.value += "";
            for (var i = 0; i < fieldValuesMap.keys_.length; i++) {
                if (!this.controller_.isFieldValueValid(command.blockId, fieldValuesMap.keys_[i], command.value) || isNaN(parseInt(fieldValuesMap.get(fieldValuesMap.keys_[i])))) {
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

    var block = SpeechBlocks.BlockUtils.getBlock(command.blockId, SpeechGames.workspace);
    var value = $("#synonyms synonym[type='" + block.type + "'][field='" + fields[fieldIndex] + "'][alias='" + command.value + "']").attr("property") || command.value;
    var dropdowns = this.getDropdownValues_(block, fields[fieldIndex]);
    if (dropdowns.length > 0) {
        var synonyms = $("#synonyms synonym[type='" + block.type + "'][field='" + fields[fieldIndex] + "']").map(function() { return $(this).attr("alias") }).toArray()
        if (synonyms.length > 0) {
            if (synonyms.indexOf(command.value) < 0) {
                var msg = "Sorry, I didn't understand '" + command.value + "'. You can say " + synonyms.map(function(x) { return "'" + x + "'" }).join(" or ") + " here.";
                throw new SpeechBlocks.UserError(msg);
            }
        } else {
            if (dropdowns.indexOf(String(value)) < 0) {
                var msg = "Sorry, I didn't understand '" + command.value + "'. You can say " + dropdowns.map(function(x) { return "'" + x + "'" }).join(" or ") + " here.";
                throw new SpeechBlocks.UserError(msg);
            }
        }
    }
    this.controller_.setBlockField(command.blockId, fields[fieldIndex], value);
};

SpeechBlocks.Interpreter.prototype.getDropdownValues_ = function(block, field) {
    for (var i = 0; i < block.inputList.length; i++) {
        var inputList = block.inputList[i];
        for (var j = 0; j < inputList.fieldRow.length; j++) {
            if (inputList.fieldRow[j].name == field) {
                if (inputList.fieldRow[j] instanceof Blockly.FieldDropdown) {
                    return inputList.fieldRow[j].menuGenerator_.map(function(x) { return x[1] });
                } else {
                    return [];
                }
            }
        }
    }
    return [];
};

/**
 * Delete a specified block.
 * @param {string} blockId The ID of the block to delete.
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
};

/**
 * Opens or closes a specified menu.
 * @param {Object} command Command object from parser.
 * @private
 */
SpeechBlocks.Interpreter.prototype.menuAction_ = function(command) {
    if (command.actionType == 'open') {
        this.controller_.openMenu(command.menu);
    } else if (command.actionType == 'close') {
        this.controller_.closeMenu();
    }
};