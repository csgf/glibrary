/**
 * Created by Antonio Di Mariano on 19/10/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
module.exports = function(app) {

  var User = app.models.user;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;

  var repository = app.models['repository'];

/*
  User.create([
    {username: 'John',   email: 'john@doe.com',        password: 'opensesame'},
    {username: 'Jane',   email: 'jane@doe.com',        password: 'opensesame'},
    {username: 'Bob',    email: 'bob@projects.com',    password: 'opensesame'},
    {username: 'Nathan', email: 'nathan@gmail.com', password: 'opensesame'}

  ], function (err, users) {
    if (err) throw err;
    console.log('Users created',users);
  })
*/




  User.findOne({where :{ email:'nathan@gmail.com'}},function(err,user) {
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

  User.findOne({where :{ email:'bob@projects.com'}},function(err,user) {
    if (err) throw err;
    if (user) {
      console.log("User:", user)
      Role.create({
        name: 'repoA'

      }, function (err, role) {
        if (err) throw err;
        console.log("Created role:", role);
        //make bob repoA member
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


}
