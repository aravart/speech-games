/**
 * @author Trace Carrasco <tcarrasco@wisc.edu> 
 * @author David Liang <david.liang@wisc.edu>
 */
 
function LevensteinDistance() { };

/**
 * Computes the Levenstein editing distance str1 and str2
 * @param str1 - first string
 * @param str2 - second string
 * @return the edit distance between the two strings
 */
LevensteinDistance.prototype.findLevensteinDistance = function (str1, str2) {
    if (str1.length === 0)
        return str2.length;
    if (str2.length === 0)
        return str1.length;
    var d = [];
    for (var i = 0; i <= str2.length; i++) {
        d[i] = [i];
    }
    for (var k = 0; k <= str1.length; k++) {
        d[0][k] = k;
    }
    for (var i = 1; i <= str2.length; i++) {
        for (var k = 1; k <= str1.length; k++) {
            d[i][k] = Math.min(d[i - 1][k - 1] + (str2[i-1] === str1[k-1] ? 0 : 1), Math.min(d[i][k - 1] + 1, d[i - 1][k] + 1));
        }
    }
    return parseInt(d[str2.length][str1.length],10);
};