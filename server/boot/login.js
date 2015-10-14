/**
 * Created by Antonio Di Mariano on 01/10/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
module.exports = function(app) {
  var User = app.models.user;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;
  var AccessToken = app.models.AccessToken;
  var repository = app.models.Repository;


  var modelACL = require('../../common/helpers/modelACL');
  var rp = new modelACL(app);

/*
  User.login({email: 'misterno@gmail.com', password: 'test'}, function (err, accesstoken) {
    console.log("This is the token: ", accesstoken);
    accesstoken.validate(function (err, isValid) {
      if (err) throw err;
      console.log("isValid", isValid);
    })
      var acl_allow_read = {
        "model": "Repository",
        "accessType": "READ",
        "principalType": "ROLE",
        "principalId": "$authenticated",
        "permission": "ALLOW"
      }
      var acl_deny_all = {
        "accessType": "*",
        "principalType": "ROLE",
        "principalId": "$everyone",
        "permission": "DENY"
      }
*/
//      repository.settings.acls.push(acl_deny_all);
//    repository.settings.acls.push(acl_allow_read);




      /*
       AccessToken.findOne(function(err,token){
       console.log("ERR:",err);
       console.log("TOKEN:",token);
       token.validate(function(err,isValid){
       console.log("ERR",err);
       console.log("----isValid",isValid);
       })

       })
       */
  //  });


    /*
     var User = app.models.user;
     User.create({email: 'nathan@never.com', password: 'bar', username:'nathan'}, function(err, user) {
     console.log("Created user" , user);




     });

     */
    /*
     User.find(function(e,v){
     if(e) consolelog("NO:",e);
     console.log("USERS LIST :",v);
     })

     */

    /*
     User.login({
     email: "nathan@never.com",
     password: "bar"
     }, 'user', function(err, token) {
     if (err) console.log("Errore :", err)


     token = token.toJSON();
     username = token.user.username
     accessToken =token.id
     console.log("TOKEN:", token);
     console.log("TOKEN:",username + " AccessTOken: "+accessToken );

     });

     */

    /*
     User.login({username: 'nathan', password: 'bar'}, function(err, accessToken) {
     console.log("ACCESSTOKEN :", accessToken);
     });
     */

}
