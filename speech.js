/**
 * @fileoverview Driver script for speech processing.
 * @author aravart@cs.wisc.edu (Ara Vartanian)
 */
goog.provide('SpeechGames');

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
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if paramater not found.
 * @return {string} The parameter value or the default value if not found.
 */
SpeechGames.getStringParamFromUrl = function(name, defaultValue) {
  var val =
      window.location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Extracts a numeric parameter from the URL.
 * If the parameter is absent or less than min_value, min_value is
 * returned.  If it is greater than max_value, max_value is returned.
 * @param {string} name The name of the parameter.
 * @param {number} minValue The minimum legal value.
 * @param {number} maxValue The maximum legal value.
 * @return {number} A number in the range [min_value, max_value].
 */
SpeechGames.getNumberParamFromUrl = function(name, minValue, maxValue) {
  var val = Number(SpeechGames.getStringParamFromUrl(name, 'NaN'));
  return isNaN(val) ? minValue : goog.math.clamp(minValue, val, maxValue);
};

/**
 * Maximum number of levels.  Common to all apps.
 * @public @const
 */
SpeechGames.MAX_LEVEL = 12;

/**
 * User's current level (e.g. 5).
 * @public
 */
SpeechGames.LEVEL =
    SpeechGames.getNumberParamFromUrl('level', 1, SpeechGames.MAX_LEVEL);

/**
 * Bind a function to a button's click event.
 * On touch-enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!Function} func Event handler to bind.
 */
SpeechGames.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};

// Initialize microphone and speech handling.
$(document).ready(function() {
  SpeechGames.speech = new SpeechGames.Speech();
  SpeechGames.controller = SpeechBlocks.Controller.injectIntoDiv('blocklyDiv', {
    media: 'lib/google-blockly/media/',
    trashcan: false,
    scrollbars: false,
    toolbox: document.getElementById('toolbox')
  });
  SpeechGames.interpreter = new SpeechBlocks.Interpreter(SpeechGames.controller);
  SpeechGames.workspace = SpeechGames.controller.workspace_;

  if(!getParameterByName('debug')) {
    $('#debug').hide();
  }

  if(!getParameterByName('demo')) {
    SpeechGames.speech.awake = true;
  } else {
    SpeechGames.speech.demoMode = true;
    SpeechGames.speech.awake = false;
    SpeechGames.speech.setMicInterval();
    console.log("demo mode");
  }
  if (getParameterByName('level')) {
    SpeechGames.speech.awake = true;
  }
   $('#q')
    .change(SpeechGames.speech.scheduleParse.bind(SpeechGames.speech))
    .mousedown(SpeechGames.speech.scheduleParse.bind(SpeechGames.speech))
    .mouseup(SpeechGames.speech.scheduleParse.bind(SpeechGames.speech))
    .click(SpeechGames.speech.scheduleParse.bind(SpeechGames.speech))
    .keydown(SpeechGames.speech.scheduleParse.bind(SpeechGames.speech))
    .keyup(SpeechGames.speech.scheduleParse.bind(SpeechGames.speech))
    .keypress(SpeechGames.speech.scheduleParse.bind(SpeechGames.speech));

  $('#microphone')
      .click(SpeechGames.speech.toggleDictation.bind(SpeechGames.speech));
  if (SpeechGames.speech.demoMode && !SpeechGames.speech.awake) {
     $("#user-message").hide().text("Say 'Hey Jerry' to wake me up.").fadeIn(500);
  } else {
    $("#user-message").hide().text("Awaiting your command!").fadeIn(500);
  }

  // $('#runButton').on('click', run);
  // $('#showButton').on('click', showCode);

  $('#debugButton').on('click', function() { 
    $('#debug').toggle();
  });
  $('#buttonRow').hide();
  $('#levelDescription').text(Turtle.descriptions[SpeechGames.LEVEL]);
});

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
    this.mic_animate = 'https://www.google.com/intl/en/chrome/assets/common/images/content/mic-animate.gif';
    this.mic = 'https://www.google.com/intl/en/chrome/assets/common/images/content/mic.gif';
    this.parseTimer = null;
};

SpeechGames.Speech.prototype.setMicInterval = function() {
  if (!window.location.origin.includes("file")) {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(function() {
      if (!this.listening) {
        this.listening = true;
        this.startDictation(); 
      } 
    }.bind(this), 100);
  } else {
    console.log("Cannot use speech from local files!");
  }
};

SpeechGames.Speech.prototype.speechCorrections = function(speech) {
  speech = speech.toLowerCase();
  speech = speech.replace(/\bqueens\b/, 'please');
  speech = speech.replace(/\bfreeze out\b/, 'please add');
  speech = speech.replace(/\bhave\b/, 'add');
  speech = speech.replace(/\bhad\b/, 'add');
  speech = speech.replace(/\batom\b/, 'add a');
  speech = speech.replace(/\bad a\b/, 'add a');
  speech = speech.replace(/\badam\b/, 'add a');
  speech = speech.replace(/\badam's\b/, 'add a');
  speech = speech.replace(/\bcut\b/, 'put');
  speech = speech.replace(/\bport\b/, 'put');
  speech = speech.replace(/\bfoot\b/, 'put');
  speech = speech.replace(/\bfort\b/, 'put');
  speech = speech.replace(/\bwalk\b/, 'block');
  speech = speech.replace(/\bblack\b/, 'block');
  speech = speech.replace(/\block\b/, 'block');
  speech = speech.replace(/\badd remove\b/, 'add a move');
  speech = speech.replace(/\badam block\b/, 'add a move block');
  speech = speech.replace(/\bnew block\b/, 'move block');
  speech = speech.replace(/\broof\b/, 'move');
  speech = speech.replace(/\broom\b/, 'move')
  speech = speech.replace(/\bflu\b/, 'move');;
  speech = speech.replace(/\bnerve\b/, 'move');
  speech = speech.replace(/\bfuse block\b/, 'move block');
  speech = speech.replace(/\bbroccoli\b/, 'block 3');
  speech = speech.replace(/\bnumber to\b/, 'number 2');
  speech = speech.replace(/\bone\b/, '1');
  speech = speech.replace(/\btwo\b/, '2');
  speech = speech.replace(/\bthree\b/, '3');
  speech = speech.replace(/\b425\b/, '4 to 5');
  speech = speech.replace(/\bblock to\b/, 'block 2');
  speech = speech.replace(/\bblock what\b/, 'block 1');
  speech = speech.replace(/\bblock won\b/, 'block 1');
  speech = speech.replace(/\bunblock\b/, 'in block');
  speech = speech.replace(/\bterm\b/, 'turn');
  speech = speech.replace(/\b - \b/, ' to ');
  speech = speech.replace(/\b272\b/, 'to 72');
  return speech;
};

SpeechGames.Speech.prototype.startDictation = function() {
  if (window.hasOwnProperty('webkitSpeechRecognition')) {
    if (this.recognition) {
      this.recognition.stop();
    }
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = function() {
      console.log("started");
      this.listening = true;
      if (!this.animating) {
        this.animating = true;
        document.getElementById('microphone').src = this.mic_animate;
      }
    }.bind(this);

    this.recognition.onresult = function(e) {
      var unfiltered = e.results[0][0].transcript;
      var corrections = this.speechCorrections(unfiltered);
      $("#q").val(corrections);
      this.recognition.stop();
      this.parseSpeech();
    }.bind(this);
    
    this.recognition.onerror = function(e) {
      console.log('error');
      this.listening = false;
     }.bind(this);

    this.recognition.onend = function(e)  {
      console.log('end');
      this.listening = false;
    }.bind(this);

    this.recognition.start();
  }
};

SpeechGames.Speech.prototype.toggleDictation = function() {
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
    this.setMicInterval();
  }
};

SpeechGames.Speech.prototype.checkHeyJerry = function() {
  if (this.awake || this.speech === "hey jerry" || (this.speech.includes("h") || this.speech.includes("j") || this.speech.includes("a"))) {
    this.awake = true;
    return true;
  } else {
    return false;
  }
};

SpeechGames.Speech.prototype.buildErrorMessage = function(e) {
  return e.location !== undefined ? 'Line ' + e.location.start.line + ', column ' + e.location.start.column + ': ' + e.message : e.message;
};

SpeechGames.Speech.prototype.parseSpeech = function() {
  this.previousRecognitionTime = Date.now();
  this.oldQ = $('#q').val();
  $('#parse-message').attr('class', 'message progress').text('Parsing the input...');
  $('#output').addClass('disabled').text('Output not available.');
  var result = false;
  this.speech = "";
  try {
    this.speech = $('#q').val().toLowerCase();
    console.log(this.speech);
    if (!this.awake && this.demoMode) {
      this.checkHeyJerry();
      if (this.awake) {
        $('#user-message').hide().text("Awaiting your command!").fadeIn(200);
        $("#q").val("");
        return;
      } else {
        $("#user-message").hide().text("Say 'Hey Jerry' to wake me up.").fadeIn(500);
        $("#q").val("");
        return;
      }
    }
    this.output = parser.parse(this.speech);
    console.log(this.output);
    $('#parse-message')
          .attr('class', 'message info')
          .text('Input parsed successfully.');
    $('#output').removeClass('disabled').text(jsDump.parse(this.output));
    this.response = this.interpretSpeech();
    clearTimeout(this.timeout);
    this.result = true;
    $("#user-message").hide().text(this.response).fadeIn(200);
    $("#q").val("");
  } catch (e) {
    console.log(e);
    if(e instanceof SpeechBlocks.UserError) {
      $('#user-message').text(e.message);
    } else {
      $('#parse-message').attr('class', 'message error').text(this.buildErrorMessage(e));
      if(this.speech !== '') {
        $('#user-message').hide().text('Sorry, I didn\'t understand \"' + this.speech + '\"').fadeIn(200);
        $("#q").val("");
        clearTimeout(this.timeout);
        this.timeout = setTimeout(function(){
          $('#user-message').hide().text("Awaiting your command!").fadeIn(200);
        }.bind(this), 5000);
      }
    }
  }
  return result;
};

SpeechGames.Speech.prototype.interpretSpeech = function() {
  if (this.output !== null) {
    return SpeechGames.interpreter.interpret(this.output);
  }
};

SpeechGames.Speech.prototype.scheduleParse = function() {
  if ($('#q').val() === this.oldQ) {
    return;
  }

  if (this.parseTimer !== null) {
    clearTimeout(this.parseTimer);
    this.parseTimer = null;
  }

  this.parseTimer = setTimeout(function() {
    this.parseSpeech();
    this.parseTimer = null;
  }.bind(this), 1000);
};

// utility functions
function createCode() {
  Blockly.JavaScript.addReservedWords('code');
  return Blockly.JavaScript.workspaceToCode(SpeechGames.workspace);
}

function showCode() {
  var modalEl = document.createElement('generatedCode');
  modalEl.style.width = '400px';
  modalEl.style.height = '300px';
  modalEl.style.margin = '100px auto';
  modalEl.style.backgroundColor = '#ff';
  modalEl.textContent = createCode();
  mui.overlay('on', modalEl);
}

function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
