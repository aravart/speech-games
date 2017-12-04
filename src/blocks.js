/**
 * @fileoverview Define blocks for Speech Games.
 * @author aravart@cs.wisc.edu (Ara Vartanian), ehernandez4@wisc.edu (Evan Hernandez), david.liang@wisc.edu (David Liang)
 */

HUE = 160
LEFT_TURN = ' \u21BA';
RIGHT_TURN = ' \u21BB';

Blockly.Blocks['turtle_move'] = {
  init: function ()
  {
    this.setColour(HUE);
    this.appendDummyInput().appendField("move");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Moves turtle forward.");
  }
};

Blockly.JavaScript['turtle_move'] = function (block)
{
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '0';
  return 'move(\'block_id_' + block.id + '\');\n';
};

// Blockly.Blocks['turtle_move'] = {
//   init: function() {
//     var DIRECTIONS =
//         [["move forward by", 'moveForward'],
//          ["move backward by", 'moveBackward']];
//     this.setColour(HUE);
//     this.appendValueInput('VALUE')
//         .setCheck('Number')
//         .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
//     this.setPreviousStatement(true);
//     this.setNextStatement(true);
//     this.setTooltip("Moves the turtle forward or backward by the specified amount.");
//   }
// };

// Blockly.JavaScript['turtle_move'] = function(block) {
//   var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || '0';
//   return block.getFieldValue('DIR') +
//       '(' + value + ', \'block_id_' + block.id + '\');\n';
// };

// Blockly.Blocks['turtle_move_internal'] = {
//   init: function() {
//     var DIRECTIONS =
//         [["move forward by", 'moveForward'],
//          ["move backward by", 'moveBackward']];
//     var VALUES =
//         [['20', '20'],
//          ['50', '50'],
//          ['100', '100'],
//          ['150', '150']];
//     this.setColour(HUE);
//     this.appendDummyInput()
//         .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR')
//         .appendField(new Blockly.FieldDropdown(VALUES), 'VALUE');
//     this.setPreviousStatement(true);
//     this.setNextStatement(true);
//     this.setTooltip("Moves the turtle forward or backward by the specified amount.");
//   }
// };

// Blockly.JavaScript['turtle_move_internal'] = function (block)
// {
//   var value = block.getFieldValue('VALUE');
//   return block.getFieldValue('DIR') +
//     '(' + value + ', \'block_id_' + block.id + '\');\n';
// };

// Blockly.Blocks['turtle_turn'] = {
//   init: function ()
//   {
//     var DIRECTIONS = [
//       ["turn right by", 'turnRight'],
//       ["turn left by", 'turnLeft']
//     ];
//     // Append arrows to direction messages.
//     DIRECTIONS[0][0] += RIGHT_TURN;
//     DIRECTIONS[1][0] += LEFT_TURN;
//     this.setColour(HUE);
//     this.appendValueInput('VALUE')
//       .setCheck('Number')
//       .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR');
//     this.setPreviousStatement(true);
//     this.setNextStatement(true);
//     this.setTooltip("Turns the turtle left or right by the specified number of degrees.");
//   }
// };

// Blockly.JavaScript['turtle_turn'] = function (block)
// {
//   var value = Blockly.JavaScript.valueToCode(block, 'VALUE',
//     Blockly.JavaScript.ORDER_NONE) || '0';
//   return block.getFieldValue('DIR') +
//     '(' + value + ', \'block_id_' + block.id + '\');\n';
// };

Blockly.Blocks['turtle_turn_internal'] = {
  init: function ()
  {
    var DIRECTIONS = [
      ["turn right", 'turnRight'],
      ["turn left", 'turnLeft']
    ];
    var VALUES = [
      ['1\u00B0', '1'],
      ['45\u00B0', '45'],
      ['72\u00B0', '72'],
      ['90\u00B0', '90'],
      ['120\u00B0', '120'],
      ['144\u00B0', '144']
    ];
    // Append arrows to direction messages.
    DIRECTIONS[0][0] += RIGHT_TURN;
    DIRECTIONS[1][0] += LEFT_TURN;
    this.setColour(HUE);
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(DIRECTIONS), 'DIR')
      .appendField(new Blockly.FieldLabel('by','by'))
      .appendField(new Blockly.FieldDropdown(VALUES), 'VALUE');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Turns the turtle left or right by the specified number of degrees.");
  }
};

Blockly.JavaScript['turtle_turn_internal'] = function (block)
{
  var value = block.getFieldValue('VALUE');
  return block.getFieldValue('DIR') +
    '(' + value + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_width'] = {
  init: function ()
  {
    this.setColour(HUE);
    this.appendValueInput('WIDTH')
      .setCheck('Number')
      .appendField("set width to");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Changes the width of the pen.");
  }
};

Blockly.JavaScript['turtle_width'] = function (block)
{
  var width = Blockly.JavaScript.valueToCode(block, 'WIDTH',
    Blockly.JavaScript.ORDER_NONE) || '1';
  return 'penWidth(' + width + ', \'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_pen'] = {
  init: function ()
  {
    this.jsonInit({
      "message0": "%1",
      "args0": [{
        "type": "field_dropdown",
        "name": "PEN",
        "options": [
          ["pen up", "penUp"],
          ["pen down", "penDown"]
        ]
      }],
      "previousStatement": null,
      "nextStatement": null,
      "colour": HUE,
      "tooltip": "Lifts or lowers the pen, to stop or start drawing."
    });
  }
};

Blockly.JavaScript['turtle_pen'] = function (block)
{
  return block.getFieldValue('PEN') +
    '(\'block_id_' + block.id + '\');\n';
};

Blockly.Blocks['turtle_colour'] = {
  init: function ()
  {
    this.setColour(HUE);
    this.appendValueInput('COLOUR')
      .setCheck('Color')
      .appendField("set color to");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Changes the color of the pen.");
  }
};

Blockly.JavaScript['turtle_colour'] = function (block)
{
  var colour = Blockly.JavaScript.valueToCode(block, 'COLOUR',
    Blockly.JavaScript.ORDER_NONE) || '\'#000000\'';
  return 'penColour(' + colour + ', \'block_id_' +
    block.id + '\');\n';
};

Blockly.Blocks['turtle_colour_internal'] = {
  init: function ()
  {
    this.setColour(HUE);
    this.appendDummyInput()
      .appendField("set color to")
      .appendField(new Blockly.FieldColour('#ff0000'), 'COLOUR');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Changes the color of the pen.");
  }
};

Blockly.JavaScript['turtle_colour_internal'] = function (block)
{
  var colour = '\'' + block.getFieldValue('COLOUR') + '\'';
  return 'penColor(' + colour + ', \'block_id_' +
    block.id + '\');\n';
};


Blockly.Blocks['turtle_repeat_internal'] = {
  init: function ()
  {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_REPEAT_TITLE,
      "args0": [{
        "type": "field_dropdown",
        "name": "TIMES",
        "options": [
          ["2", "2"],
          ["3", "3"],
          ["4", "4"],
          ["5", "5"],
          ["360", "360"]
        ]
      }],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "tooltip": Blockly.Msg.CONTROLS_REPEAT_TOOLTIP,
      "helpUrl": Blockly.Msg.CONTROLS_REPEAT_HELPURL
    });
    this.appendStatementInput('DO').appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
  }
};

Blockly.JavaScript['turtle_repeat_internal'] = Blockly.JavaScript['controls_repeat'];