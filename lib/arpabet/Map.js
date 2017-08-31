/**
 * @author Trace Carrasco <tcarrasco@wisc.edu>
 */

/**
 * Creates a map that maps a specific key and data
 * @public
**/
function Map() {
    this.keys = new Array();
    this.data = new Array();
}

/**
 * Inserts a single key data pair to the Map
 * @param {[key, data]} An object of form: 
 * Note: Duplicate keys will override previous key to new key
 * @public
**/
Map.prototype.Add = function(aPair) {
	var duplicateIndex = this.keys.indexOf(aPair[0]);
	if(duplicateIndex === -1) {
		this.keys.push(aPair[0]);
		this.data.push(aPair[1]);
	}
	else {
		this.data[duplicateIndex] = aPair[1];
	}
}

/**
 * Inserts batch of key data pairs into the Map
 * @param {array[key, data]} Array of key data pairs 
 * Note: Duplicate keys will override previous key to new key
 * @public
**/
Map.prototype.AddBatch = function (pairs) {
    _this = this;
    pairs.forEach(function(aPair) {
		var duplicateIndex = _this.keys.indexOf(aPair[0]);
		if(duplicateIndex === -1) {
			_this.keys.push(aPair[0]);
			_this.data.push(aPair[1]);
		}
		else {
			_this.data[duplicateIndex] = aPair[1];
		}
	});
}

/**
 * Finds the corresponding data element from the given key
 * @param {object} A key whose data you are trying to get
 * @return {object} The key's corresponding data or null if key is not in map
 * @public
**/
Map.prototype.GetByKey = function(k) {
	var index = this.keys.indexOf(k);
	if(index == -1)
		return null;
    return this.data[index];
}

/**
 * Finds the corresponding key for the given key
 * @param {object} A piece of data whose key you are looking for
 * @return {object} The data's corresponding keys in an arry or null if data is not in map
 * @public
**/
Map.prototype.GetByData = function(d) {
	var index = this.data.indexOf(d);
	if(index == -1)
		return null;
	var results = [];
	for(var i = 0; i < this.data.length; i++) {
		if(d === this.data[i])
			results.push(this.keys[i]);
	}
    return results;
}

/**
 * formates the Map into a new viewing table
 * @return {string} Map string for viewing
 * @public
**/
Map.prototype.ToString = function() {
	var table = "";
	for(var i = 0; i < this.keys.length; i++) {
		table = table + "\n " + this.keys[i] + " -> " + this.data[i] + " \n";
	}
	return table;
}
