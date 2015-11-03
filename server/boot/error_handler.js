/**
 * Created by Antonio Di Mariano on 15/07/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */

module.exports = function error_handler(server) {
  var Role = server.models.Role;

  server.on('uncaughtException', function (er) {
      console.log("uncaughtException");
      console.error(er.stack)
      server.exit(1);
  })



  Role.create({
    name: "repositoryOwner"
  }, function (err, role) {
    if (err) throw err;
  })



}
