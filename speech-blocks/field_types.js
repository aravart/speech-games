/**
 * @fileoverview Enumeration for relevant field types.
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */
'use strict';

goog.provide('SpeechBlocks.FieldTypes');

/**
 * Relevant field types for SpeechBlocks.
 * @enum {number}
 */
SpeechBlocks.FieldTypes = {
  /** Textual input, e.g. for print string literals. */
  TEXT_INPUT: 1,

  /** Numerical input, e.g. for number blocks. */
  NUMBER_INPUT: 2,

  /** Radial angle picker, allows user to select value from 0-360 degrees. */
  ANGLE_PICKER: 3,

  /** 
   * Colour grid, allows user to select one of several colours from 
   * a (predefined) palette. 
   */
  COLOUR_PICKER: 4,

  /** 
   * Drop-down that allows user to select existing variable, 
   * rename it, and/or create a new one. 
   */
  VARIABLE_PICKER: 5,

  /** A generic drop-down with predefined selections. */
  DROP_DOWN: 6,

  /** Field types that we do not support. */
  IRRELEVANT: 7
};
