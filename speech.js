goog.provide('SpeechGames');

SpeechGames.workspace = null

$(document).ready(function() {
  var oldQ = null;
  var parseTimer = null;
  var output = null;
  controller = SpeechBlocks.Controller.injectIntoDiv('blocklyDiv', { media: 'lib/google-blockly/media/',
       toolbox: document.getElementById('toolbox')}); 
  SpeechGames.workspace = controller.workspace_
  var interpreter = new SpeechBlocks.Interpreter(controller);

  function startDictation() {
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
      var mic_animate = 'http://www.google.com/intl/en/chrome/assets/common/images/content/mic-animate.gif';
      var mic = 'http://www.google.com/intl/en/chrome/assets/common/images/content/mic.gif';
      var recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      document.getElementById('microphone').src = mic_animate;
      recognition.start();
      recognition.onresult = function(e) {
        document.getElementById('q').value = e.results[0][0].transcript;
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
      output = parser.parse($("#q").val().toLowerCase());

      $("#parse-message")
            .attr("class", "message info")
            .text("Input parsed successfully.");
      $("#output").removeClass("disabled").text(jsDump.parse(output));
      interpretSpeech();
      var result = true;
    } catch (e) {
      $("#parse-message").attr("class", "message error").text(buildErrorMessage(e));

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


// $("#runButton").on("click", run);
$("#showButton").on("click", showCode);

});

function createCode() {
  Blockly.JavaScript.addReservedWords('code');
  return Blockly.JavaScript.workspaceToCode(controller.workspace_);
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
