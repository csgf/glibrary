/**
 * Created by Antonio Di Mariano on 01/11/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */


/**
 *
 * @param code
 * @param msg
 * @returns {Error}
 */
exports.sendError = function (code, msg) {

  var error = new Error();
  error.statusCode = code;
  error.message = msg
  delete error.stack;
  return error;
}

