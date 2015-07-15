/**
 * Created by hellbreak on 15/07/15.
 */
module.exports = function error_handler(server) {

  server.on('uncaughtException', function (er) {
  console.log("uncaughtException");
  console.error(er.stack)
  server.exit(1);
  })

}
