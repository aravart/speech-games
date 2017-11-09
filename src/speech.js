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
    this.demoMode = false;
    this.awake = false;
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
  var valueSets = Object.values(workspaceState.valueSets.map_.map_);
  // convert the values to english words
  for (var i = 0; i < valueSets.length; i++) {
    var valueSet = valueSets[i];
    for (var j = 0; j < valueSet.length; j++) {
      // the turn values are turnUp and turnDown so removing 'turn' and lowercasing the word suffices
      // likewise with pen values
      valueSet[j] = valueSet[j].toLowerCase().replace("turn","").replace("pen","");
    }
    valueSets[i] = valueSet;
  }
  // TODO aravart Change corrector to accept two lists of types
  // One list for blocks that can be added which comes from Turyle.blockTypes
  // Second list for blocks currently on workspace to be involved in change / edit commands
  var blockTypes = ['move', 'turn', 'pen', 'color', 'repeat'];
  // var blockTypes = Object.values(workspaceState.blockTypes.map_.map_);
  return this.corrector_.correct(speech, blockIds, valueSets, blockTypes);
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
 * Checks to see if 'Hey Jerry' has been said yet.
 * @return {boolean} True if Hey Jerry has been said yet, else false.
 * @private
 */
SpeechGames.Speech.prototype.checkHeyJerry_ = function() {
  if (this.awake || this.rawSpeech === "hey jerry") {
    this.awake = true;
    return true;
  } else {
    return false;
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
  // $('#output').addClass('disabled').text('Output not available.');
  var result = false;
  this.rawSpeech = $('#q').val();
  try {
    // if demoing, check to see if 'hey jerry' was said
    // if (!this.awake && this.demoMode) {
    //   this.checkHeyJerry_();
    //   if (this.awake) {
    //     $('#user-message').hide().text("Awaiting your command!").fadeIn(200);
    //     return;
    //   } else {
    //     $("#user-message").hide().text("Say 'Hey Jerry' to wake me up.").fadeIn(500);
    //     return;
    //   }
    // }

    this.correctedSpeech = this.correctSpeech_(this.rawSpeech);
    $('#q').val(this.correctedSpeech);
    this.output = parser.parse(this.correctedSpeech);

    // change message displayed to user
    // $('#parse-messasge')
    //       .attr('class', 'message info')
    //       .text('Input parsed successfully.');
    // $('#output').removeClass('disabled').text(jsDump.parse(this.output));

    // interpret and perform action
    this.response = this.interpretSpeech_(this.output);
    clearTimeout(this.timeout);
    this.result = true;
    $("#user-message").hide().text('I heard "' + this.correctedSpeech + '"').fadeIn(200);
    
    // submit proposed corrections
    // this.proposeCorrections(this.misrecognized, this.rawSpeech);
    // this.misrecognized = [];

  } catch (e) {
    console.log(e);

    if(e instanceof SpeechBlocks.UserError) {
      $('#user-message').text(e.message);
    } else {
      $('#parse-message').attr('class', 'message error').text(this.buildErrorMessage_(e));
      if(this.rawSpeech !== '') {
        // if (this.rawSpeech.length > 0) {
        //   this.misrecognized.push(this.rawSpeech);
        // }
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
 * Initializes all of the SpeechGames objects and begins listening.
 */
$(document).ready(function() {
  SpeechGames.LEVEL = SpeechGames.getNumberParamFromURL_('level', 1, SpeechGames.MAX_LEVEL);
  blockTypes =  Turtle.blockTypes[SpeechGames.LEVEL]
  SpeechGames.speech = new SpeechGames.Speech();
  // TODO aravart Iterate through toolbox, remove elements not in blockTypes
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

  if(SpeechGames.getParameterByName_('demo') || window.location.href.includes('firebase') || window.location.href.includes('localhost')) {
    SpeechGames.speech.demoMode = true;
    SpeechGames.speech.awake = false;
    SpeechGames.speech.setMicInterval_();
    console.log("DEMOING");
  }

  if(SpeechGames.getParameterByName_('debug')) {
    $('#q').css('visibility','visible');
  } else {
    $('#debug').hide();
  }

  // if (window.location.href.includes('firebase') || window.location.href.includes('localhost'))  {
  //   firebase.auth().onAuthStateChanged(function(user) {
  //     if (user) {
  //       SpeechGames.speech.loadCorrections();
  //     }
  //   });
  // }

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
  // if (SpeechGames.speech.demoMode && !SpeechGames.speech.awake) {
  // $("#user-message").hide().text("Say 'Hey Jerry' to wake me up.").fadeIn(500);
  // } else {
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
