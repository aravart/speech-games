/**
 * Corrects phrases to commands in the speech games grammar based on the edit
 * distances of the arpabet phonetic sequences.
 * @author Trace Carrasco <tcarrasco@wisc.edu>
 * @author David Liang <david.liang@wisc.edu>
 * @author Sahib Singh Pandori <pandori@wisc.edu>
 */

 /**
  * Maximum fraction of phoneme sequence that can be modified
  * @public
  */
Corrector.prototype.MAX_MODIFICATION = 0.75;

/**
* Corrects a recognition from speech according to the given parameters
* @param recognition - string being corrected
* @param blockIds - all the possible blocks in the workspace
* @param valueSets - the specific values all the blocks can take on
* @param blockTypes - all the possible block types in the workspace
* @return the corrected recognition
*/
Corrector.prototype.correct = function(recognition, blockIds, valueSets, blockTypes) {
	if (recognition === "") {
		return "";
  	}

	// generate all commands given the block ids, block types, and value sets
	var commands = this.commandGenerator_.generateCommands(blockIds, valueSets, blockTypes);

	// find command with minimal edit phoneme edit distance from the recognition
	var minDistance = Number.MAX_SAFE_INTEGER;
	var minDistanceCommand = recognition;
	var rseq = this.toPhoneme_(recognition);

	// tie tracker
	var tie = [];

	commands.forEach(function (command) {
		var cseq = this.toPhoneme_(command);
		var distance = this.findLevensteinDistance_(rseq, cseq);
		if (distance < minDistance) {
			minDistance = distance;
			minDistanceCommand = command;
		} else if (distance == minDistance) {
			// inserting first elements into saved ties
			if (tie.length === 0) {
				tie.push({
					c : command,
					d : distance
				});
				tie.push({
					c : minDistanceCommand,
					d : minDistance
				});
			}
			else if (tie.length > 0) {
				// seeing if we have a new minDistance from the previous tie
				if (tie[0].distance > distance) {
					tie = [];
				}
				tie.push({
					c : command,
					d : distance
				});
			}
		}
	}.bind(this));

	// Seeing if we had a tie in our lowest distance (i.e the one that we are correcting to)
	// if(tie.length > 0 && tie[0].d == minDistance) {
	// 	var log = "Tie at recognition: " + '"' + recognition + '"\n' ;
	// 	tie.forEach(function(com) {
	// 		log += '"' + com.c + ' -->\t ' + this.toPhoneme_(com.c) + '"\n';
	// 	}.bind(this));
	// 	log += "All with editing distance: " + minDistance;
	// 	console.log(log);
	// }

	// if (minDistance > 0) {
	// 	console.log('"' + recognition + '" corrected to "' + minDistanceCommand + '" with an edit distance of ' + minDistance);
	// 	console.log('rseq: ' + rseq + "\ncseq: " + this.toPhoneme_(minDistanceCommand));
	// }

	return minDistance < (Corrector.MAX_MODIFICATION * rseq.length) ? minDistanceCommand : recognition;
}

/**
* Converts the phrase to a phoneme sequence
* @param phrase Phrase to be converted
* @return A list of phonemes
*/
Corrector.prototype.toPhoneme_ = function(phrase) {
   // remove colons (useful case: 1:44 recognized, 144 uttered, and no valid commands use a colon)
   phrase = phrase.replace(/:/g, "").toLowerCase();
   var words = phrase.split(" ");
   var seq = [];
   words.forEach(function (word) {
       if (Object.keys(this.arpabetExtras_).includes(word)) {
           // map a word not in arpabet to a word in arpabet and then map to phoneme
           this.arpabetExtras_[word].split(" ").forEach(function(subword) {
               seq.push(this.arpabet_.getArpabetValue(subword));
           }.bind(this));
       } else {
           var arpabetValue = this.arpabet_.getArpabetValue(word);
           if (arpabetValue === undefined) {
               seq.push(word);
           } else {
               seq.push(arpabetValue);
           };
       };
   }.bind(this));
   // put each phoneme in one slot in the array
   return seq.join(" ").split(" ");
}

/**
 * Computes the Levenstein editing distance array1 and array2
 * @param arr1 - first array
 * @param arr2 - second array
 * @return the edit distance between the two arrays
 */
Corrector.prototype.findLevensteinDistance_ = function (arr1, arr2) {
    if (arr1.length === 0) {
        return arr2.length;
    }
    if (arr2.length === 0) {
        return arr1.length;
    }

    var d = [];
    for (var i = 0; i <= arr2.length; i++) {
        d[i] = [i];
    }
    for (var k = 0; k <= arr1.length; k++) {
        d[0][k] = k;
    }
    for (var i = 1; i <= arr2.length; i++) {
        for (var k = 1; k <= arr1.length; k++) {
            d[i][k] = Math.min(d[i - 1][k - 1] + (arr2[i-1] === arr1[k-1] ? 0 : 1), Math.min(d[i][k - 1] + 1, d[i - 1][k] + 1));
        }
    }

    return d[arr2.length][arr1.length];
}

function Corrector() {
	this.arpabet_ = new Arpabet();
	this.commandGenerator_ = new CommandGenerator();
	this.arpabetExtras_ = new Array();
	this.arpabetExtras_.mapBatch([
		['1', 'one'],
		['2', 'two'],
		['3', 'three'],
		['4', 'four'],
		['5', 'five'],
		['6', 'six'],
		['7', 'seven'],
		['8', 'eight'],
		['9', 'nine'],
		['10', 'ten'],
		['24', 'twenty four'],
		['45', 'forty five'],
		['52', 'fifty two'],
		['72', 'seventy two'],
		['90', 'ninety'],
		['95', 'ninety five'],
		['100', 'one hundred'],
		['120', 'one twenty'],
		['124', 'one twenty four'],
		['125', 'one twenty five'],
		['144', 'one forty four'],
		['245', 'two forty five'],
		['290', 'two ninety'],
		['300', 'three hundred'],
		['360', 'three sixty'],
		['400', 'four hundred'],
		['500', 'five hundred'],
		['700', 'seven hundred'],
		['9400', 'ninety four hundred'],
		['+', 'plus'],
		['k\'nex', 'connects'],
		['6-2', 'six two'],
		['1,20', 'one twenty'],
		['1,44', 'one forty four'],
		['lakhs', 'locks'],
		['1/2', 'one half'],
		['xbox', 'box'],
		['blog', 'bog'],
		['$2', 'two'],
		['walkthrough', 'walk through'],
		['nextflix', 'net flicks'],
		['hr', 'her'],
		['3-under', 'three under'],
		['5-under', 'five under'],
		['loc', 'lock'],
		['kinect', 'connect'],
		['tutuapp', 'two to'],
		['connectbot', 'connect pot'],
		['block1', 'block one'],
		['pokemon', 'poke man'],
		['farquad', 'far quad'],
		['24125', 'twenty four one twenty five'],
		['miquelon', 'nickel on'],
		['pop3', 'pop three'],
		['4in', 'four in']
	]);
}
