/**
 * Created by Antonio Di Mariano on 13/10/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */

module.exports = function (app) {

  var User = app.models.user;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;
  var ACL = app.models.ACL;
  var loopback = require('loopback');


  var isAdmin = function (userId, next) {

    app.models.Role.findOne({where: {name: 'admin'}}, function (err, role) {

      if (role) {
        app.models.RoleMapping.findOne({
          where: {
            principalId: userId,
            roleId: role.id
          }
        }, function (e, mapping) {
          console.log("ADMIN MAPPING",mapping)
          if (mapping) {
            next(true)
          } else next(false)
        })
      } else {
        next(false)
      }
    })
  }
  return {



  isAllowed: function (context, next) {

      var ctx = loopback.getCurrentContext();
      var accessToken = ctx.get('accessToken');
      var req = context.req;
      if (!req.params) return next(500);

      var collection_name = (!req.params.collection_name ? null : req.params.collection_name )
      var repository_name = req.params.repo_name
      var userId = accessToken.userId


      if (!userId) {
        return next(401)
      }
    console.log("USERID",userId);

      isAdmin(userId, function (hasAdminRole) {
        console.log("NEXT ADMIN", hasAdminRole)
        if (hasAdminRole) return next(200)
        else {
          if (collection_name != null) {
            var where = {
              where: {
                and: [
                  {"repositoryName": repository_name},
                  {"collectionName": collection_name},
                  {"userId": userId}
                ]
              }
            }
          } else {
            console.log("collection_name NULL")
            var where = {
              where: {
                and: [
                  {"userId": userId},
                  {"repositoryName": repository_name},
                  {"collectionName": null}

                ]
              }
            }
          }
          console.log("WHERE:", JSON.stringify(where));
          app.models.access.findOne(where, function (er, access) {
            console.log("ACCESS:", access)

            if (access) {
              if (collection_name == null && access.collectionName) {
                return next(401);
              }
              else
                return next(200)
            } else {
              return next(401)
            }
          })
        }
      })
    },
    createRole: function createRole(roleName, next) {

      console.log("roleName", roleName);
      app.models.Role.findOne({'name': roleName}, function (err, role) {
        if (err) {
          console.log('Role.findOne Error', err);
          next(false);
        }
        console.log("Role", role);
        if (role) {
          console.log("[createRole] Role is already created")
          next(false)
        } else {
          app.models.Role.create({
            name: roleName
          }, function (err, role) {
            if (err) throw err;
            console.log('[createRole][Role.createad] : ', role);
            next(true);
          });
        }
      })
    },

    addPrincipalIdToRole: function addPrincipalIdToRole(roleName, principalType, principalId, next) {

      var Role = app.models.Role;
      var RoleMapping = app.models.RoleMapping;

      console.log("[addPrincipalIdToRole]",roleName + " " + principalId + " " + principalType)
      //cerco il ruolo ed estraggo id
      app.models.Role.findOne({ where: {'name': roleName}}, function (err, role) {
        if (err) {
          console.log('Role.findOne Error', err);
          next(false);

        }
        if (role) {
          console.log("------------------------------------ ")
          console.log("[Role.id]:", role.id)
          console.log("[Role.name]:", role.name)

          console.log("[principalType]:", principalType)
          console.log("[principalId]:", principalId)
          console.log("------------------------------------ ")

          /*
           ISSUE
           The principleId field in
           the Rolemapping model is stored as a string in mongodb
           Delete principalId = (principalId).toString() if you plan to use relation db
           */

          principalId = (principalId).toString()

          RoleMapping.find({where:  {"and" :[{principalId: principalId},{roleId:role.id}]}}, function (err, rolemapping) {
            if (err) {
              console.log('RoleMapping.find', err);
              next(false);
            }
            if (rolemapping && rolemapping.length > 0) {
              console.log("[addPrincipalIdToRole]:esiste return false", rolemapping.length);
              return next(false)
            }
            console.log("!rolemapping", principalType + ' ' + principalId + " " + rolemapping.length);
            role.principals.create(
              {
                principalType: principalType,
                principalId: principalId
              }, function (err, principal) {

                if (err) {
                  console.log('[addPrincipalIdToRole][role.principals.create] Error', err);
                  next(false);
                } else {
                  console.log("[addPrincipalIdToRole] OK", '')
                  next(true);
                }
              })
          })
        }
        else {
          console.log("[addPrincipalIdToRole]!Role");
          next(false);
        }
      })
    },

    loadACL: function loadACL(modelName, next) {

      ACL.find({where: {model: modelName}}, function (err, acl) {

        if (acl && acl.length > 0) {

          acl.forEach(function (entry) {
            if (app.models[modelName]) {
              console.log(" entry:", entry);
              app.models[modelName].settings.acls.push(entry);
            }
          })
          next(true)

        }


      })

    },

    setACLtoModel: function setACLToModel(model, acl, next) {
      model.settings.acls.push(acl);
      ACL.create(acl, function (err, result) {
        console.log('[setACLtoModel] ACL entry created: %j', result);
        next();
      })
    },

    initDefaultDenyACL: function initDefaultDenyACL(model, next) {
      model.settings.acls.push
      (
        {
          "accessType": "*",
          "principalType": "ROLE",
          "principalId": "$everyone",
          "permission": "DENY"
        });
      next(true);
    },

    roleResolver: function roleResolver() {

    },


  }
}
