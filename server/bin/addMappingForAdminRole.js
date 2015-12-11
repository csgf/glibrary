/**
 * Created by Antonio Di Mariano on 10/12/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */


var path = require('path');
var app = require(path.resolve(__dirname, '../server'));
var User = app.models.user;
var Role = app.models.Role;
var RoleMapping = app.models.RoleMapping;
var repository = app.models['repository'];


User.findOne({where: {email: 'admin@ct.infn.it'}}, function (err, user) {
  if (err) throw err;
  if (user) {
    console.log("User:", user)
    Role.findOne(
      {where: {name: 'admin'}}, function (err, role) {
        console.log("ROLE:", role)
        if (err) throw err;
        console.log("Created role:", role);
        //make nathan admin
        role.principals.create({
          principalType: RoleMapping.USER,
          principalId: user.id,
          roleId: role.id,
          roleName: "admin"
        }, function (err, principal) {
          if (err) throw err;
          console.log("Added user: ", principal)
        })
      })
  }
})








