/** 
 */

function Assert() {

}

Assert.assertNotUndefined = function (obj) {
    if (obj === undefined) {
        throw 'Not undefined assertion failed. ' + obj;
    }
}