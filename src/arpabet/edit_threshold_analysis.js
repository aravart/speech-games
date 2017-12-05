/**
  * Use positive and negative values to find an optimal value for the Maximum
  * edit threshold (for phonemes)
  * @author Sahib Singh Pandori <pandori@wisc.edu>
  */


/**
  * Begin the analysis by reading the data file and calling processData
  */
function evaluate_thresholds() {
  $.ajax({
    type: "GET",
    // For analyzing positive examples use correct-utterances.csv instead
    url: "../../theory/rec-errors/threshold-analysis/data/incorrect-utterances.csv",
    dataType: "text",
    success: function(data) {
      processData(data);
    }
 });
}


/**
  * Reads a given CSV file and prints the accuracy for each threshold value
  * @param allText the text in the csv file
  */
function processData(allText) {
  // workspace related information
  var BLOCK_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var VALUE_SETS = [
      ['up', 'down'],
      ['left', 'right'],
      ['45', '72', '90', '120', '144'],
      ['2', '3', '4', '5'],
      ['red', 'orange', 'blue', 'green', 'yellow', 'purple', 'brown', 'black', 'white']];
  var BLOCK_TYPES = ['move', 'turn', 'pen', 'color', 'repeat'];

  // limits and steps for analysis
  var THRESHOLD_INCREMENT = 0.01;
  var MAX_THRESHOLD = 3.0;

  // Get all lines and header
  var allTextLines = allText.split(/\r\n|\n/);
  var headers = allTextLines[0].split(',');
  var results = [];

  // For each value of threshold go over all lines and calculate accuracy
  for (var j = 0; j <= MAX_THRESHOLD; j += THRESHOLD_INCREMENT) {
    // Set the threshold to current value
    var corrector = new Corrector();
    corrector.MAX_MODIFICATION = j;

    // Calculate the accuracy with current threshold
    var numCorrect = 0, numExamples = 0;
    for (var i = 1; i < allTextLines.length; i++) {
      var data = allTextLines[i].split(',');
      if (data.length < 2)
        continue;
      numExamples++;
      var cor = corrector.correct(data[1], BLOCK_IDS, VALUE_SETS, BLOCK_TYPES);
      var corrected = cor != '';
      // For analyzing negative examples uncomment this and comment line 64
      var correct = !corrected;
      // For analyzing positive examples uncomment this
      // var correct = cor == data[0] && corrected
      if (correct) {
        numCorrect++;
      }
    }
    var accuracy = numCorrect/numExamples;
    console.log(j + "," + accuracy);
  }
}
