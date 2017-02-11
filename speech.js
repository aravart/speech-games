goog.provide('SpeechGames');

goog.require('Turtle.Answers');

SpeechGames.controller = null;
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
 */
SpeechGames.MAX_LEVEL = 12;

/**
 * User's level (e.g. 5).
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

$(document).ready(function() {
  var oldQ = null;
  var parseTimer = null;
  var output = null;
  SpeechGames.controller = SpeechBlocks.Controller.injectIntoDiv('blocklyDiv', { 
       media: 'lib/google-blockly/media/',
       trashcan: false,
       scrollbars: false,
       toolbox: document.getElementById('toolbox')}); 
  SpeechGames.workspace = SpeechGames.controller.workspace_;
  var interpreter = new SpeechBlocks.Interpreter(SpeechGames.controller);

  function speechCorrections(speech) {
    speech = speech.toLowerCase();
    speech = speech.replace(/\batom\b/,"add a");
    speech = speech.replace(/\badam's\b/,"add a");
    speech = speech.replace(/\bblack\b/,"block");
    speech = speech.replace(/\block\b/,"block");
    speech = speech.replace(/\badam block\b/,"add a move block");
    speech = speech.replace(/\bnumber to\b/,"number 2");
    speech = speech.replace(/\bone\b/,"1");
    speech = speech.replace(/\b425\b/,"4 to 5");
    return speech;
  }

  function startDictation() {
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
      var mic_animate = 'https://www.google.com/intl/en/chrome/assets/common/images/content/mic-animate.gif';
      var mic = 'https://www.google.com/intl/en/chrome/assets/common/images/content/mic.gif';
      var recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      document.getElementById('microphone').src = mic_animate;
      recognition.start();
      recognition.onresult = function(e) {
        unfiltered = e.results[0][0].transcript;
        corrections = speechCorrections(unfiltered);
        document.getElementById('q').value = corrections;
        recognition.stop();
        document.getElementById('microphone').src = mic;
        parseSpeech();
      };
      recognition.onerror = function(e) {
        recognition.stop();
        document.getElementById('microphone').src = mic;
      }
    }
  }

  function buildErrorMessage(e) {
    return e.location !== undefined ? "Line " + e.location.start.line + ", column " + e.location.start.column + ": " + e.message : e.message;
  }

  function parseSpeech() {
    oldQ = $("#q").val();

    $("#parse-message").attr("class", "message progress").text("Parsing the input...");
    $("#output").addClass("disabled").text("Output not available.");

    try {
      var speech = $("#q").val()
      output = parser.parse(speech.toLowerCase());

      $("#parse-message")
            .attr("class", "message info")
            .text("Input parsed successfully.");
      $("#output").removeClass("disabled").text(jsDump.parse(output));
      interpretSpeech();
      var result = true;
      $("#user-message").hide().text("Got it!").fadeIn(200);
    } catch (e) {
      if(e instanceof SpeechBlocks.UserError) {
        $("#user-message").text(e.message)
      } else {
      $("#parse-message").attr("class", "message error").text(buildErrorMessage(e));
      if(speech != "") {
        $("#user-message").text("Sorry, I didn't understand '" + speech + "'");
      }
      }
      var result = false;
    }
    return result;
  }

  function interpretSpeech() {
    if (output !== null) {
       interpreter.interpret(output);
    }
  }

  function scheduleParse() {
    if ($("#q").val() === oldQ) { return; }
    if (parseTimer !== null) {
      clearTimeout(parseTimer);
      parseTimer = null;
    }

    parseTimer = setTimeout(function() {
      parseSpeech();
      parseTimer = null;
    }, 500);
  }

  $("#q")
  .change(scheduleParse)
  .mousedown(scheduleParse)
  .mouseup(scheduleParse)
  .click(scheduleParse)
  .keydown(scheduleParse)
  .keyup(scheduleParse)
  .keypress(scheduleParse);

  $("#microphone")
  .click(startDictation);

  $("#user-message").hide().text("Click on the microphone and say something!").fadeIn(500);

// $("#runButton").on("click", run);
// $("#showButton").on("click", showCode);
if(!getParameterByName("debug")) {
  $("#debug").hide();
}
$("#debugButton").on("click", function() { $("#debug").toggle() });
$("#buttonRow").hide();

$("#levelDescription").text(Turtle.descriptions[SpeechGames.LEVEL])

});

function createCode() {
  Blockly.JavaScript.addReservedWords('code');
  return Blockly.JavaScript.workspaceToCode(SpeechGames.controller.workspace_);
}

function showCode() {
  var modalEl = document.createElement('generatedCode');
  modalEl.style.width = '400px';
  modalEl.style.height = '300px';
  modalEl.style.margin = '100px auto';
  modalEl.style.backgroundColor = '#ff';
  modalEl.textContent = createCode()
  mui.overlay('on', modalEl);
}

function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
