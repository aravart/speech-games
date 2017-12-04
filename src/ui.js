/**
 * @fileoverview Controls UI and suggestions.
 * @author aravart@cs.wisc.edu (Ara Vartanian)
 * @author dliang@cs.wisc.edu (David Liang)
 * @author pandori@wisc.edu (Sahib Singh Pandori)
 * @author ehernandez4@wisc.edu (Evan Hernandez)
 */

$(document).ready(function() {

  var title = goog.dom.$('levels')
  var debugFlag = '';
  if(SpeechGames.getParameterByName_('debug')) {
    debugFlag = "&?debug=1";
  }
  for (var i = 0; i < SpeechGames.MAX_LEVEL; i++) {
    if(i == SpeechGames.LEVEL - 1) {
      var levelElement = goog.dom.createDom('span', {
        'class': 'level_number level_done', 
        'id': 'level' + (i + 1), 
        'href': '?level=' + (i + 1) + debugFlag}, 
        (i + 1).toString());    
    } else {
      var levelElement = goog.dom.createDom('a', {
        'class': (i == SpeechGames.MAX_LEVEL - 1) ? 'level_number' : 'level_dot',
        'id': 'level' + (i + 1), 
        'href': '?level=' + (i + 1)  + debugFlag},
        (i == SpeechGames.MAX_LEVEL - 1) ? (i+1).toString() : '');
    }
    goog.dom.appendChild(title, levelElement);
    goog.dom.appendChild(title, goog.dom.createTextNode(' '));
  }

  var sug = new SpeechGames.Suggestions();
  sug.setSuggestions(['get']); // Initially, suggest adding a block.
  SpeechGames.controller.addStateChangeListener(function(state) {
    var sugs = ['get']; // We always suggest adding blocks.
    if (state.empty) {
      sug.setSuggestions(sugs); 
      return;
    }
    
    if (!state.allBlocksConnected) {
      sugs.push('connect_under');
    }
    
    var blocks = SpeechGames.workspace.getAllBlocks();
    // has repeat block type
    var hasRepeat = false;
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].type == 'turtle_repeat_internal') {
        hasRepeat = true;
      } 
    }

    if (hasRepeat && blocks.length >= 2) {
      sugs.push('connect_inside');
    }

    if (!state.modifiableBlockIds.isEmpty()) {
      sugs.push('change');
    }

    // When the workspace is nonempty, we always suggest deleting blocks
    // and running the program.
    sugs.push('delete');
    sugs.push('run');

    sug.setSuggestions(sugs);
  });

});
