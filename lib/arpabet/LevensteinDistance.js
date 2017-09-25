/**
 * @author Trace Carrasco <tcarrasco@wisc.edu> 
 * @author David Liang <david.liang@wisc.edu>
 */

/**
 * A class that finds levenstein distance between items.
 */
function LevensteinDistance() { }

/**
 * Computes the Levenstein editing distance array1 and array2
 * @param array1 - first array
 * @param array2 - second array
 * @return the edit distance between the two arrays
 */
LevensteinDistance.prototype.findLevensteinDistance = function (arr1, arr2) {
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