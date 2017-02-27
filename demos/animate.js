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
  setTimeout(function() { addMoveBlock(225, 75) }, 1500);
  setTimeout(function() {
    $(".block2")
    .simulate("drag-n-drop", {
      dy:-35,
      interpolation: {
        stepCount: 100,
        stepDelay: 2
      }
    });
  }, 2500);
};
