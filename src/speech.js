/**
 * @fileoverview Driver script for speech processing.
 * @author aravart@cs.wisc.edu (Ara Vartanian), dliang@cs.wisc.edu (David Liang)
 */
goog.provide('SpeechGames');
goog.provide('SpeechGames.Speech');

goog.require('Blockly.Workspace');
goog.require('SpeechBlocks.Controller');
goog.require('SpeechBlocks.Interpreter');
goog.require('Turtle.Answers');

/**
 * A global reference to the current workspace's controller.
 * @public {SpeechBlocks.Controller}
 */
SpeechGames.controller = null;

/**
 * A global reference to the workspace itself.
 * @public {Blockly.Workspace}
 */
SpeechGames.workspace = null;

/**
 * A global reference to the interpreter.
 * @public {Blockly.Interpreter}
 */
SpeechGames.interpreter = null;

/**
 * Maximum number of levels.  Common to all apps.
 * @public @const
 */
SpeechGames.MAX_LEVEL = 12;

/**
 * User's current level (e.g. 5).
 * @public
 */
SpeechGames.LEVEL = null;

/**
 * Bind a function to a button's click event.
 * On touch-enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!Function} func Event handler to bind.
 * @public
 */
SpeechGames.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};


/**
 * Instantiates a speech object, used for controlling speech input to interpreter.
 * @public
 * @constructor
 */
SpeechGames.Speech = function() {
    this.oldQ = null;
    this.parseTimer = null;
    this.previousRecognitionTime = null;
    this.output = null;
    this.timeout = null;
    this.animating = false;
    this.listening = false;
    this.recognition = null;
    this.mic_animate = 'assets/img/mic-animate.gif';
    this.mic = 'assets/img/mic.gif';
    this.parseTimer = null;
    // this.misrecognized = [];
    this.corrector_ = new Corrector();
};

/**
 * Sets the interval that ensures the mic is lietning (when applicable).
 * @private
 */
SpeechGames.Speech.prototype.setMicInterval_ = function() {
  if (!window.location.origin.includes("file")) {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(function() {
      if (!this.listening) {
        this.listening = true;
        this.startDictation_();
      }
    }.bind(this), 100);
  } else {
    console.log("Cannot use speech from local files!");
  }
};

/**
 * Hard replacements for certain phrases.
 * @param {string} speech Utterance to be corrected.
 * @return {string} The corrected utterance.
 * @private
 */
SpeechGames.Speech.prototype.correctSpeech_ = function(speech) {
  var workspaceState = SpeechGames.controller.workspaceState_;
  var blockIds = Object.values(workspaceState.blockIds.map_.map_);
  var blockValuesetMap = workspaceState.blockValuesetMap;
  var blockTypeMap = new goog.structs.Map();
  blockTypeMap.set('controls_if', 'if');
  blockTypeMap.set('controls_repeat_ext', 'repeat');
  blockTypeMap.set('turtle_turn_internal', 'turn');
  blockTypeMap.set('turtle_move', 'move');
  blockTypeMap.set('turtle_pen', 'pen');
  blockTypeMap.set('turtle_repeat_internal', 'repeat');
  blockTypeMap.set('turtle_colour_internal', 'color');
  
  var blockTypes = Turtle.blockTypes[SpeechGames.LEVEL].slice(0);
  for (var i = 0; i < blockTypes.length; i++) {
    if (blockTypeMap.containsKey(blockTypes[i])) {
      blockTypes[i] = blockTypeMap.get(blockTypes[i]);
    }
  }
  return this.corrector_.correct(speech, blockIds, blockValuesetMap, blockTypes);
};

/**
 * Restarts the listening for a new utterance.
 * @private
 */
SpeechGames.Speech.prototype.startDictation_ = function() {
  if (window.hasOwnProperty('webkitSpeechRecognition')) {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = function() {
      this.listening = true;
      if (!this.animating) {
        this.animating = true;
        document.getElementById('microphone').src = this.mic_animate;
      }
    }.bind(this);

    this.recognition.onresult = function(e) {
      this.recognition.stop();
      this.rawSpeech = e.results[0][0].transcript.toLowerCase();
      $('#q').val(this.rawSpeech);
      this.parseSpeech_();
    }.bind(this);

    this.recognition.onerror = function(e) {
      this.listening = false;
     }.bind(this);

    this.recognition.onend = function(e)  {
      this.listening = false;
    }.bind(this);

    this.recognition.start();
  }
};

/**
 * Toggles the listening from the microphone.
 * @private
 */
SpeechGames.Speech.prototype.toggleDictation_ = function() {
  if (this.listening) {
    this.listening = !this.listening;
    this.recognition.stop();
    this.recognition = null;
    this.animating = false;
    document.getElementById('microphone').src = this.mic;
    clearInterval(this.interval);
    this.interval = null;
  } else {
    document.getElementById('microphone').src = this.mic_animate;
    this.setMicInterval_();
  }
};

/**
 * Parses the input and sends the result to SpeechGames.interpreter. Then outputs the response
 * to the user interface.
 * @private
 */
SpeechGames.Speech.prototype.parseSpeech_ = function() {
  this.previousRecognitionTime = Date.now();
  this.oldQ = $('#q').val();
  var result = false;
  this.rawSpeech = $('#q').val();
  try {
    this.correctedSpeech = this.correctSpeech_(this.rawSpeech);
    $('#q').val(this.correctedSpeech);
    this.output = parser.parse(this.correctedSpeech);

    this.response = this.interpretSpeech_(this.output);
    clearTimeout(this.timeout);
    this.result = true;
    $("#user-message").hide().text('I heard "' + this.correctedSpeech + '"').fadeIn(200);
  } catch (e) {
    console.log(e);

    if (e instanceof SpeechBlocks.UserError) {
      $('#user-message').text(e.message);
    } else {
      $('#parse-message').attr('class', 'message error').text(this.buildErrorMessage_(e));
      if (this.rawSpeech !== '') {
        $('#user-message').hide().text('Sorry, I didn\'t understand \"' + this.rawSpeech + '\"').fadeIn(200);
        clearTimeout(this.timeout);
        this.timeout = setTimeout(function(){
          $('#user-message').hide().text("Awaiting your command!").fadeIn(200);
        }.bind(this), 5000);
      }
    }
  }
  return result;
};

/**
 * Calls the SpeechGames.interpreter's interpret function.
 * @return {string} Response for user (i.e. 'Added a move block.').
 * @private
 */
SpeechGames.Speech.prototype.interpretSpeech_ = function(parsedSpeech) {
  if (parsedSpeech !== undefined) {
    return SpeechGames.interpreter.interpret(parsedSpeech);
  }
};

/**
 * Schedule's the parsing to occur after a second of inactivity.
 * @private
 */
SpeechGames.Speech.prototype.scheduleParse_ = function() {
  if ($('#q').val() !== this.oldQ) {
    if (this.parseTimer !== null) {
      clearTimeout(this.parseTimer);
      this.parseTimer = null;
    }
    this.parseTimer = setTimeout(function() {
      this.parseSpeech_();
      this.parseTimer = null;
    }.bind(this), 1000);
  }
};

/**
 * Builds an error message.
 * @param {exception} e Exception from which to build the error message.
 * @return {exception} The error message.
 */
SpeechGames.Speech.prototype.buildErrorMessage_ = function(e) {
  return e.location !== undefined ? 'Line ' + e.location.start.line + ', column ' + e.location.start.column + ': ' + e.message : e.message;
};

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {!string} name The name of the parameter.
 * @param {!string} defaultValue Value to return if paramater not found.
 * @return {string} The parameter value or the default value if not found.
 */
SpeechGames.getStringParamFromURL_ = function(name, defaultValue) {
  var val =
      window.location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Extracts a numeric parameter from the URL.
 * If the parameter is absent or less than min_value, min_value is
 * returned.  If it is greater than max_value, max_value is returned.
 * @param {!string} name The name of the parameter.
 * @param {!number} minValue The minimum legal value.
 * @param {!number} maxValue The maximum legal value.
 * @return {number} A number in the range [min_value, max_value].
 */
SpeechGames.getNumberParamFromURL_ = function(name, minValue, maxValue) {
  var val = Number(SpeechGames.getStringParamFromURL_(name, 'NaN'));
  return isNaN(val) ? minValue : goog.math.clamp(minValue, val, maxValue);
};

/**
 * Generates code from the blockly workspace.
 * @private
 */
SpeechGames.createCode_ = function() {
  Blockly.JavaScript.addReservedWords('code');
  return Blockly.JavaScript.workspaceToCode(SpeechGames.workspace);
};

/**
 * Shows the generated code.
 * @private
 */
SpeechGames.showCode_ = function() {
  var modalEl = document.createElement('generatedCode');
  modalEl.style.width = '400px';
  modalEl.style.height = '300px';
  modalEl.style.margin = '100px auto';
  modalEl.style.backgroundColor = '#ff';
  modalEl.textContent = createCode_();
  mui.overlay('on', modalEl);
};

/**
 * Gets a parameter from the url.
 * @param {!string} name Name of the param (i.e. debug)
 * @param {string} url Optional url, otherwise window url is used.
 */
SpeechGames.getParameterByName_ = function(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return '';
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Gets all params except for level flag from the url.
 * @return {string} extraParams Extra params, besides level.
 */
SpeechGames.getExtraParams = function() {
  var href = window.location.href;
  var extraParams = href.substring(href.indexOf('?')).replace('?level='+SpeechGames.LEVEL, '');
  
  if (!extraParams.includes('?microphone') && SpeechGames.speech.listening) {
    extraParams += '&?microphone=1';
  } else {
    if (!SpeechGames.speech.listening) {
      extraParams = extraParams.replace('&?microphone=1','');
    }
  }

  if (extraParams[0] != '&') {
    extraParams = '&' + extraParams;
  }
  return extraParams;
}

/**
 * Edit toolbox xml.
 * @param {$document} document Index of speech games
 * @param {array} blockTypes Block types to be included in the toolbox XML
 */
SpeechGames.editToolboxXml_ = function(document, blockTypes) {
  var $xmls = document.getElementsByTagName('xml');
  var $toolbox = $xmls.toolbox.children;
  for(var i = 0; i < $toolbox.length; ) {
    if (!blockTypes.includes($toolbox[i].getAttribute('type')))
      $toolbox[i].remove();
    else
      i++;
  }
}

/**
 * Initializes all of the SpeechGames objects and begins listening.
 */
$(document).ready(function() {
  SpeechGames.LEVEL = SpeechGames.getNumberParamFromURL_('level', 1, SpeechGames.MAX_LEVEL);
  blockTypes =  Turtle.blockTypes[SpeechGames.LEVEL];
  SpeechGames.editToolboxXml_(document, blockTypes);
  SpeechGames.speech = new SpeechGames.Speech();
  SpeechGames.workspace = Blockly.inject('blocklyDiv', {
    media: 'lib/google-blockly/media/',
    trashcan: false,
    scrollbars: false,
    toolbox: document.getElementById('toolbox')
  });
  SpeechGames.controller = new SpeechBlocks.Controller(
      SpeechGames.workspace,
      SpeechGames.getParameterByName_('animate'));
  SpeechGames.interpreter = new SpeechBlocks.Interpreter(SpeechGames.controller, blockTypes);

  if (SpeechGames.getParameterByName_('microphone')) {
    SpeechGames.speech.setMicInterval_();
  }

  if (SpeechGames.getParameterByName_('debug')) {
    $('#q').css('visibility','visible');
  } else {
    $('#debug').hide();
  }

  // listen for mouse clicks, key presses
  $('#q')
    .change(SpeechGames.speech.scheduleParse_.bind(SpeechGames.speech))
    .mousedown(SpeechGames.speech.scheduleParse_.bind(SpeechGames.speech))
    .mouseup(SpeechGames.speech.scheduleParse_.bind(SpeechGames.speech))
    .click(SpeechGames.speech.scheduleParse_.bind(SpeechGames.speech))
    .keydown(SpeechGames.speech.scheduleParse_.bind(SpeechGames.speech))
    .keyup(SpeechGames.speech.scheduleParse_.bind(SpeechGames.speech))
    .keypress(SpeechGames.speech.scheduleParse_.bind(SpeechGames.speech));

  // if microphone icon clicked
  $('#microphone')
    .click(SpeechGames.speech.toggleDictation_.bind(SpeechGames.speech));
  $("#user-message").hide().text("Awaiting your command!").fadeIn(500);
  // }

  // $('#runButton').on('click', run);
  // $('#showButton').on('click', showCode_);

  // $('#debugButton').on('click', function() {
  //   $('#debug').toggle();
  // });
  // $('#buttonRow').hide();

  $('#levelDescription').text(Turtle.descriptions[SpeechGames.LEVEL]);
});
