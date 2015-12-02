/**
 * Created by Antonio Di Mariano on 02/12/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
/**
 * Created by Antonio Di Mariano on 19/10/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */

var path = require('path');
var app = require(path.resolve(__dirname, '../server'));


var User = app.models.user;
var Role = app.models.Role;
var RoleMapping = app.models.RoleMapping;

var repository = app.models['repository'];


User.create([
  {username: 'admin', email: 'admin@ct.infn.it', password: 'opensesame2015'}
], function (err, users) {
  if (err) throw err;
  console.log('Users created', users);
  User.findOne({where: {email: 'admin@ct.infn.it'}}, function (err, user) {
    if (err) throw err;
    if (user) {
      console.log("User:", user)
      Role.create({
        name: 'admin'

      }, function (err, role) {
        if (err) throw err;
        console.log("Created role:", role);
        //make nathan admin
        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: user.id
        }, function (err, principal) {
          if (err) throw err;
          console.log("Added user: ", principal)
        })
      })
    }
  })
})







