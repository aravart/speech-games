/**
 * @fileoverview Represents errors whose messages should be relayed to user.
 * @author aravart@cs.wisc.edu (Ara Vartanian)
 */
'use strict';

goog.provide('SpeechBlocks.UserError');

SpeechBlocks.UserError = function(message) {
  this.name = 'UserError';
  this.stack = (new Error()).stack;
  this.message = message;
};

SpeechBlocks.UserError.prototype = Object.create(Error.prototype);
