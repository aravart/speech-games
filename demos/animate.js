var addMoveBlock = function(dx, dy) {
  $(".blocklyFlyout text:contains('move')").simulate('drag-n-drop', {
    dx: dx,
    dy: dy,
    interpolation: {
      stepCount: 100,
      stepDelay: 2
    }
  });
};

var runDemo = function() {
  setTimeout(function() { addMoveBlock(225, 0); }, 500);
  setTimeout(function() { addMoveBlock(225, 75); }, 1500);
  setTimeout(function() {
    var predBlock = SpeechGames.workspace.getBlockById('1');
    var succBlock = SpeechGames.workspace.getBlockById('2');

    var bottomOfPredY = predBlock.getRelativeToSurfaceXY().y + predBlock.getHeightWidth().height;
    var topOfSuccY = succBlock.getRelativeToSurfaceXY().y;

    $(".block2")
    .simulate("drag-n-drop", {
      dy:(bottomOfPredY - topOfSuccY),
      interpolation: {
        stepCount: 100,
        stepDelay: 2
      }
    });
  }, 2500);
};
