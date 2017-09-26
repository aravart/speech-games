/** 
 */

function Assert() {

}

Assert.assertNotUndefined = function (obj, name) {
    if (obj === undefined) {
        var errorMessage;
        if (name !== undefined) {
            errorMessage = 'Not undefined assertion failed for ' + name + ' object.';
        } else {
            errorMessage = 'Not undefined assertion failed. ';
        }
        throw errorMessage;
    }
}