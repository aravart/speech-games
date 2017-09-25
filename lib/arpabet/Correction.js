/**
 * @author Trace Carrasco <tcarrasco@wisc.edu> 
 * @author David Liang <david.liang@wisc.edu>
 */

function Correction() { 
    this.Arpabet = new Arpabet();
    this.SYM_MAP = addBatchToJSMap(new Array(), [
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
		['pop3', 'pop three']
	]);
}

/** 
* Corrects a recognition from speech according to the given parameters
* @param recognition - string being corrected
* @param blockIds - all the possible blocks in the workspace
* @param valueSets - the specific values all the blocks can take on 
* @param blockTypes - all the possible block types in the workspace
* @return the corrected recognition 
*/
Correction.prototype.correct = function(recognition, blockIds, valueSets, blockTypes) {
    var commands = this.generateCommands(blockIds,blockTypes,valueSets);

    if (recognition === "") {
		return "";
    }
    
	var minDistance = Number.MAX_SAFE_INTEGER;
	var minDistanceCommand = recognition;
    var rseq = this.toPhoneme(recognition);


	commands.forEach(function (command) {
		var cseq = this.toPhoneme(command);
		var distance = this.findLevensteinDistance(rseq, cseq);
		if (distance < minDistance) {
			minDistance = distance;
			minDistanceCommand = command;
		} else if (distance == minDistance) {
			// handle tie
		};
	}.bind(this));
	return minDistanceCommand;
}
/** 
* Converts the phrase to a phoneme sequence
* @param phrase Phrase to be converted
* @return A list of phonemes
*/
Correction.prototype.toPhoneme = function(phrase) {
   // remove colons (useful case: 1:44 recognized, 144 uttered, and no valid commands use a colon)
   phrase = phrase.replace(/:/g, "").toLowerCase();
   var words = phrase.split(" ");
   var seq = [];
   words.forEach(function (word) {
       if (Object.keys(this.SYM_MAP).includes(word)) {
           // map a word not in arpabet to a word in arpabet and then map to phoneme
           this.SYM_MAP[word].split(" ").forEach(function(subword) {
               seq.push(this.ARPABET[subword]);
           }.bind(this));
       } else {
           var arpaVal = this.Arpabet.getArpaValue(word);
           if (arpaVal === undefined) {
               seq.push(word);
           } else {
               seq.push(arpaVal);
           };
       };
   }.bind(this));
   // this puts each phoneme in one slot in the array
   return seq.join(" ").split(" ");
}

/**
 * Computes the Levenstein editing distance array1 and array2
 * @param arr1 - first array
 * @param arr2 - second array
 * @return the edit distance between the two arrays
 */
Correction.prototype.findLevensteinDistance = function (arr1, arr2) {
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

/** 
    Generates all the GET commands
    @param : List of all possible block types
    @return: List of all valid GET commands for the block tpes
*/
Correction.prototype.generateGetCommands = function(blockTypes) {
    var commands = [];
    blockTypes.forEach(function (btype) {
        commands.push('get a ' + btype + ' block');
	});
    return commands;
}

/**
    Generates all the special commands that are unique
    @return List of all special commands that are manual added
 */ 

Correction.prototype.generateSpecialCommands = function() {
	var commands = [];
	commands.push('run the program');
	commands.push('go to the next level');
	commands.push('go to next level');
	commands.push('stay on this level');
	return commands;
}
/**
    Generates all the MOVE commands
    @param blockIds: List of all block IDs that are presume to be in the workspace
    @return List of all valid MOVE commands
 */
Correction.prototype.generateMoveCommands = function(blockIds) {
    var commands = [];
	var even = false;
    blockIds.forEach(function (blockId1) {
		blockIds.forEach(function (blockId2) {
			// Redundents, but we can get rid of these later
			commands.push('connect block ' + blockId1 + ' under block ' + blockId2);
			commands.push('connect block ' + blockId1 + ' inside block ' + blockId2);
		});
	});
    return commands;
}
/**
    Generates all CHANGE commands
    @param blockIds: List of all block IDs that are presumed to be in the workspace
    @param List of all value sets for fields
    @return List of all CHANGE commands
 */
Correction.prototype.generateChangeCommands = function(blockIds, valueSets) {
	var commands = [];
	blockIds.forEach(function (blockId) {
		valueSets.forEach(function(valueSet) {
			for(var i = 0; i < valueSet.length - 1; i++) {
				for(var j = i + 1; j < valueSet.length; j++) {
					commands.push('change ' + valueSet[i] + ' in block ' + blockId + ' to ' + valueSet[j]);
					commands.push('change ' + valueSet[j] + ' in block ' + blockId + ' to ' + valueSet[i]);
				}
			}
		});
	});
	return commands;
}
/**
    Generates all DELETE commands
    @param blockIds: List of all block IDs that are presumed in the workspace
    @return List of all valid DELETE commands
*/
Correction.prototype.generateDeleteCommands = function(blockIds) {
	var commands = [];
	blockIds.forEach(function(blockId) {
		commands.push('delete block ' + blockId);
	});
	return commands;
}

/**
Generates all possible commands give a list of block IDs, block types and field values
    @param blockIds: List of all block IDs that are presumed to be in the worspace
    @param List of all valid block types
    @param List of all field value sets
    @return The complete list of valid commands
 */
Correction.prototype.generateCommands = function(blockIds, blockTypes, valueSets) {
	var commands = [];
	commands.extend(this.generateGetCommands(blockTypes));
	commands.extend(this.generateMoveCommands(blockIds));
	commands.extend(this.generateChangeCommands(blockIds, valueSets));
	commands.extend(this.generateDeleteCommands(blockIds));
	commands.extend(this.generateSpecialCommands());
	return commands;
}

/**
    Helper method to append elementList to the calling list (this)
    @param elementList: The list of elements to be appended
 */
Array.prototype.extend = function(elementList) {
	elementList.forEach(function(e) { this.push(e) }, this);
}

/**
 * Adds a batch of key value pairs to a JS array map.
 * @param map The JS array map to which the batch will be added to.
 * @param batch The array of key-value pairs that will have the keys mapped to the value in the given map.
 * @return The map with the new key-value pairs.
 */
function addBatchToJSMap(map, batch) {
	for(var i = 0; i < batch.length; i++) {
		map[String(batch[i][0])] = String(batch[i][1]);
	};
	return map;
}
