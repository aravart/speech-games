/**
 * Blockly Games: Turtle Answers
 *
 * Copyright 2013 Google Inc.
 * https://github.com/google/blockly-games
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Sample answers for Turtle levels. Used for prompts and marking.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Turtle.Answers');

Turtle.descriptions = {
  1: 'Create a program that draws a line.',
  2: 'Create a program that draws a right angle',
  3: 'Create a program that draws a square.',
  4: 'Create a program that draws a pentagon.',
  5: 'Create a program that draws a 5-pointed star.',
  6: 'Create a program that draws a 5-pointed star and a line.',
  7: 'Create a program that draws four 5-pointed stars.',
  8: 'Create a program that draws three 5-pointed stars and a line.',
  9: 'Create a program that draws three 5-pointed stars and 4 lines.',
  10: '',
  11: '',
  12: ''
}

Turtle.blockTypes = {
    1: ['turtle_move'],
    2: ['turtle_move', 'turtle_turn_internal'],
    3: ['turtle_move', 'turtle_turn_internal', 'turtle_repeat_internal'],
    4: ['turtle_move', 'turtle_turn_internal', 'turtle_repeat_internal'],
    5: ['turtle_move', 'turtle_turn_internal', 'turtle_pen', 'turtle_colour_internal', 'turtle_repeat_internal'],
    6: ['turtle_move', 'turtle_turn_internal', 'turtle_pen', 'turtle_colour_internal', 'turtle_repeat_internal'],
    7: ['turtle_move', 'turtle_turn_internal', 'turtle_pen', 'turtle_colour_internal', 'turtle_repeat_internal'],
    8: ['turtle_move', 'turtle_turn_internal', 'turtle_pen', 'turtle_colour_internal', 'turtle_repeat_internal'],
    9: ['turtle_move', 'turtle_turn_internal', 'turtle_pen', 'turtle_colour_internal', 'turtle_repeat_internal'],
    10: ['turtle_move', 'turtle_turn_internal', 'turtle_pen', 'turtle_colour_internal', 'turtle_repeat_internal'],
    11: ['turtle_move', 'turtle_turn_internal', 'turtle_pen', 'turtle_colour_internal', 'turtle_repeat_internal'],
    12: ['turtle_move', 'turtle_turn_internal', 'turtle_pen', 'turtle_colour_internal', 'turtle_repeat_internal']
}

/**
 * Sample solutions for each level.
 * To create an answer, just solve the level in Blockly, then paste the
 * resulting JavaScript here, moving any functions to the beginning of
 * this function.
 */
Turtle.answer = function() {
  // Helper functions.
  function drawStar(length) {
    for (var count = 0; count < 5; count++) {
      Turtle.move(length);
      Turtle.turn(144);
    }
  }

  switch (SpeechGames.LEVEL) {
    case 1:
      // Line.
      Turtle.move(100);
      break;
    case 2:
      // Two Lines.
      Turtle.move(100);
      Turtle.turn(90);
      Turtle.move(100);
      break;
    case 3:
      // Square.
      for (var count = 0; count < 4; count++) {
        Turtle.move(100);
        Turtle.turn(90);
      }
      break;
    case 4:
      // Pentagon.
      for (var count = 0; count < 5; count++) {
        Turtle.move(100);
        Turtle.turn(72);
      }
      break;
    case 5:
      // Star.
      Turtle.penColor('#ffff00');
      drawStar(100);
      break;
    case 6:
      // Pen up/down.
      Turtle.penColor('#ffff00');
      drawStar(50);
      Turtle.penDown(false);
      Turtle.move(150);
      Turtle.penDown(true);
      Turtle.move(20);
      break;
    case 7:
      // Four stars.
      Turtle.penColor('#ffff00');
      for (var count = 0; count < 4; count++) {
        Turtle.penDown(false);
        Turtle.move(150);
        Turtle.turn(90);
        Turtle.penDown(true);
        drawStar(50);
      }
      break;
    case 8:
      // Three stars and a line.
      Turtle.penColor('#ffff00');
      for (var count = 0; count < 3; count++) {
        Turtle.penDown(false);
        Turtle.move(150);
        Turtle.turn(120);
        Turtle.penDown(true);
        drawStar(50);
      }
      Turtle.penDown(false);
      Turtle.turn(-90);
      Turtle.move(100);
      Turtle.penDown(true);
      Turtle.penColor('#ffffff');
      Turtle.move(50);
      break;
    case 9:
      // Three stars and 4 lines.
      Turtle.penColor('#ffff00');
      for (var count = 0; count < 3; count++) {
        Turtle.penDown(false);
        Turtle.move(150);
        Turtle.turn(120);
        Turtle.penDown(true);
        drawStar(50);
      }
      Turtle.penDown(false);
      Turtle.turn(-90);
      Turtle.move(100);
      Turtle.penDown(true);
      Turtle.penColor('#ffffff');
      for (var count = 0; count < 4; count++) {
        Turtle.move(50);
        Turtle.move(-50);
        Turtle.turn(45);
      }
      break;
    case 10:
      // Three stars and a circle.
      Turtle.penColor('#ffff00');
      for (var count = 0; count < 3; count++) {
        Turtle.penDown(false);
        Turtle.move(150);
        Turtle.turn(120);
        Turtle.penDown(true);
        drawStar(50);
      }
      Turtle.penDown(false);
      Turtle.turn(-90);
      Turtle.move(100);
      Turtle.penDown(true);
      Turtle.penColor('#ffffff');
      for (var count = 0; count < 360; count++) {
        Turtle.move(50);
        Turtle.move(-50);
        Turtle.turn(1);
      }
      break;
    case 11:
      // Three stars and a crescent.
      Turtle.penColor('#ffff00');
      for (var count = 0; count < 3; count++) {
        Turtle.penDown(false);
        Turtle.move(150);
        Turtle.turn(120);
        Turtle.penDown(true);
        drawStar(50);
      }
      Turtle.penDown(false);
      Turtle.turn(-90);
      Turtle.move(100);
      Turtle.penDown(true);
      Turtle.penColor('#ffffff');
      for (var count = 0; count < 360; count++) {
        Turtle.move(50);
        Turtle.move(-50);
        Turtle.turn(1);
      }
      Turtle.turn(120);
      Turtle.move(20);
      Turtle.penColor('#000000');
      for (var count = 0; count < 360; count++) {
        Turtle.move(50);
        Turtle.move(-50);
        Turtle.turn(1);
      }
      break;
  }
};

/**
 * Validate whether the user's answer is correct.
 * @param {number} pixelErrors Number of pixels that are wrong.
 * @return {boolean} True if the level is solved, false otherwise.
 */
Turtle.isCorrect = function(pixelErrors) {
  // if (BlocklyGames.LEVEL == BlocklyGames.MAX_LEVEL) {
  //   // Any non-null answer is correct.
  //   return BlocklyGames.workspace.getAllBlocks().length > 1;
  // }
  // console.log('Pixel errors: ' + pixelErrors);
  if (pixelErrors > 100) {
    // Too many errors.
    return false;
  }
  // if ((BlocklyGames.LEVEL <= 2 &&
  //      BlocklyGames.workspace.getAllBlocks().length > 3) ||
  //     (BlocklyGames.LEVEL == 3 &&
  //      BlocklyGames.workspace.getAllBlocks().length > 4)) {
  //   // Use a loop, dummy.
  //   var content = document.getElementById('helpUseLoop');
  //   var style = {
  //     'width': '30%',
  //     'left': '35%',
  //     'top': '12em'
  //   };
  //   BlocklyDialogs.showDialog(content, null, false, true, style,
  //       BlocklyDialogs.stopDialogKeyDown);
  //   BlocklyDialogs.startDialogKeyDown();
  //   return false;
  // }
  return true;
};
