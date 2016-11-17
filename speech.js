$(document).ready(function() {
  var oldQ = null;
  var parseTimer = null;
  var output = null;
  controller = SpeechBlocks.Controller.injectIntoDiv('blocklyDiv', { media: 'lib/google-blockly/media/',
       toolbox: document.getElementById('toolbox')}); 
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


$("#runButton").on("click", run);
$("#showButton").on("click", showCode);

});

// Turtle

var canvas = new fabric.Canvas('c');
canvas.selection = false;

function drawTurtle(canvas) {
  var c = new fabric.Circle({
    left: turtle.x,
    top: turtle.y,
    strokeWidth: 5,
    radius: 12,
    fill: '#fff',
    stroke: '#ff',
    originX: 'center',
    originY: 'center'
  });
  c.hasControls = c.hasBorders = c.selectable = false;
  canvas.add(c)

  var triangle = new fabric.Triangle({
    angle: turtle.angle * (180 / Math.PI),
    fill: '#ff',
    top: turtle.y,
    left: turtle.x,
    height: 8,
    width: 8,
    originX: 'center',
    originY: 'center',
    selectable: false
  });
  canvas.add(triangle);
}

function newTurtle() {
  return {
    x: 120,
    y: 120,
    angle: 0,
    color: 'grey',
    width: 5,
    down: true
  };
}

var turtle = newTurtle();

// Initialize canvas
// turtle.color = 'grey'
// for (var count = 0; count < 4; count++) {
//   moveForward(100);
//   turnRight(90);
// }

drawTurtle(canvas);

function beginDraw() {
  canvas.clear();
  turtle = newTurtle();
}

function endDraw() {
  drawTurtle(canvas);
}

function penUp() {
  turtle.down = false
}

function penDown() {
  turtle.down = true
}

function penColor(color) {
  turtle.color = color
};

function moveForward(distance) {
  newX = turtle.x + Math.sin(turtle.angle) * distance
  newY = turtle.y - Math.cos(turtle.angle) * distance
  if(turtle.down) {
    canvas.add(new fabric.Line([turtle.x,turtle.y,newX,newY], {
        fill: turtle.color,
        stroke: turtle.color,
        strokeWidth: turtle.width,
        selectable: false,
        originX: 'center',
        originY: 'center'
      }));
  }
  turtle.x = newX
  turtle.y = newY
};

function moveBackward(distance) {
  newX = turtle.x - Math.sin(turtle.angle) * distance
  newY = turtle.y + Math.cos(turtle.angle) * distance
  if(turtle.down) {
    canvas.add(new fabric.Line([turtle.x,turtle.y,newX,newY], {
        fill: turtle.color,
        stroke: turtle.color,
        strokeWidth: turtle.width,
        selectable: false,
        originX: 'center',
        originY: 'center'
      }));
  }
  turtle.x = newX
  turtle.y = newY
};

function turnRight(angle) {
  turtle.angle += angle / 180 * Math.PI
};

function turnLeft(angle) {
  turnRight(-angle)
};

// var workspace = Blockly.inject('blocklyDiv', { toolbox: document.getElementById('toolbox') });

function createCode() {
  Blockly.JavaScript.addReservedWords('code');
  return Blockly.JavaScript.workspaceToCode(controller.workspace_);
}

function showCode() {
    alert(createCode())
}

function run() {
  try {
    beginDraw();
    eval(createCode());
    endDraw();
    // beginDraw();
    // var myInterpreter = new Interpreter(code);
    // var nextStep = function() {
    //   if (myInterpreter.step()) {
    //     window.setTimeout(nextStep, 0);
    //   }
    // }
    // nextStep();
    // endDraw();
    // myInterpreter.run();
    // more in https://developers.google.com/blockly/guides/app-integration/running-javascript
  } catch (e) {
    alert(e);
  }
};
