/**
  * Use positive and negative values to find an optimal value for the Maximum
  * edit threshold (for phonemes)
  * @author Sahib Singh Pandori <pandori@wisc.edu>
  */

// AnalyzeThreshold.THRESHOLD_INCREMENT = 0.01;

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "src/arpabet/data.csv",
        dataType: "text",
        success: function(data) {processData(data);}
     });
});

/**
  * Reads a given CSV file and returns a list of attributes of each row
  * @param filepath - the csv file to be read
  * @return array of array of attributes of each row
  */
function processData(allText) {
  var BLOCK_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var VALUE_SETS = [
      ['up', 'down'],
      ['left', 'right'],
      ['45', '72', '90', '120', '144'],
      ['2', '3', '4', '5'],
      ['red', 'orange', 'blue', 'green', 'yellow', 'purple', 'brown', 'black', 'white']];
  var BLOCK_TYPES = ['move', 'turn', 'pen', 'color', 'repeat'];
  var THRESHOLD_INCREMENT = 0.01;

  // Get all lines and header
  var allTextLines = allText.split(/\r\n|\n/);
  var headers = allTextLines[0].split(',');
  var results = [];

  // For each value of threshold go over all lines and calculate accuracy
  for (var j = 0; j <= 1.0; j += THRESHOLD_INCREMENT) {
    // Set the threshold to current value
    var corrector = new Corrector();
    corrector.MAX_MODIFICATION = j;

    // Calculate the accuracy with current threshold
    var numCorrect = 0;
    for (var i = 1; i < allTextLines.length; i++) {
      var data = allTextLines[i].split(',');
      var cor = corrector.correct(data[1], BLOCK_IDS, VALUE_SETS, BLOCK_TYPES);
      var accepted = data[1] != cor;
      var correct = data[0] == cor;
      if ((correct && accepted) || (!correct && !accepted)) {
        numCorrect++;
      }
    }
    console.log("Threshold " + j + " = " + numCorrect/allTextLines.length);
    // Store the accuracy result
    results.push(numCorrect/allTextLines.length);
  }

  console.log(results);
}


// function AnalyzeThreshold() {
//   this.curr_threshold = AnalyzeThreshold.THRESHOLD_INCREMENT;
//   while (this.curr_threshold < 1) {
//     // TODO: Read the csv file for recognition and correction
//     var lines = this.readCSV();
//     console.log(lines);
//     // TODO: Loop through them and get accuracy at each threshold
//     // TODO: Print the accuracy for each one (and optimal threshold)
//     this.curr_threshold += AnalyzeThreshold.THRESHOLD_INCREMENT;
//   }
// }
