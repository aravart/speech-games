/** 
 * @fileoverview Defines an abstract target location on the workspace. 
 * @author ehernandez4@wisc.edu (Evan Hernandez) 
 */
'use strict';

goog.provide('SpeechBlocks.Where');

/** @abstract @constructor */
SpeechBlocks.Where = function() {};

/**
 * Places the block with the given ID at the location represented by
 * this object. Note that all successors and children of this block will
 * also be moved.
 * 
 * This function does not perform error checking beyond basic assertions.
 * That is, it is the caller's responsibility to verify the semantics of
 * the placement. 
 * 
 * This function should NOT call workspace.render(). 
 * 
 * @param {string} blockId The ID of the block to move.
 * @param {!Blockly.Workspace} workspace The current workspace.
 * @abstract
 */
SpeechBlocks.Where.prototype.place = function(blockId, workspace) {};
