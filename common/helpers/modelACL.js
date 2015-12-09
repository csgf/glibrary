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
  var async = require('async')


  var isAdmin = function (userId, next) {

    app.models.Role.findOne({where: {name: 'admin'}}, function (err, role) {

      if (role) {
        app.models.RoleMapping.findOne({
          where: {
            principalId: userId,
            roleId: role.id
          }
        }, function (e, mapping) {
          console.log("ADMIN MAPPING", mapping)
          if (mapping) {
            next(true)
          } else next(false)
        })
      } else {
        next(false)
      }
    })
  }


  var searchStringInArray = function searchStringInArray(str, strArray) {
    console.log("strArray", strArray)
    for (var j = 0; j < strArray.length; j++) {
      if (strArray[j].name == str) return true;
    }
    return false;
  }
  var addRoleMappingForRepositoryAndCollection = function (access, principalId, principalType, roleName, kindOfMapping, next) {

    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;
    console.log("[addMappingForCollection]")
    app.models.Role.findOne({where: {'name': roleName}}, function (err, role) {
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


        RoleMapping.findOne({
          where: {
            "and": [{principalType: principalType},
              {principalId: principalId},
              {roleId: role.id}]
          }
        }, function (e, mapping) {
          if (mapping) {

            console.log("kindOfMapping: ", kindOfMapping)


            console.log("******************Mapping trovato per ", mapping);
            if (kindOfMapping == 'collectionName') {
              var arrayToScan = mapping.collectionName
              var valueToPush = access.collectionName
              mapping.repositoryName.push({"name":access.repositoryName})
            }
            if (kindOfMapping == 'repositoryName') {
              var arrayToScan = mapping.repositoryName
              var valueToPush = access.repositoryName
            }
            console.log("******************valueToPush ", valueToPush);

            var result = searchStringInArray(valueToPush, arrayToScan)
            console.log("RESULT", result);
            if (result) {
              console.log("***DUPLICATO***", valueToPush)
              return next(false)
            }
           else {
              console.log(kindOfMapping, " da AGGIUNGERE",arrayToScan);
              arrayToScan.push({"name": valueToPush})
             console.log("mapping repos",mapping.repositoryName)
              RoleMapping.update(
                {
                  "id": mapping.id
                },
                {
                  principalType: principalType,
                  principalId: principalId,
                  roleId: role.id,
                  roleName: roleName,
                  repositoryName: mapping.repositoryName,
                  collectionName: mapping.collectionName

                }, function (err, map) {
                  if (err) {
                    console.log('[addPrincipalIdToRole][Error while Adding collection to existing array] Error', err);
                    return next(false);
                  }
                  console.log("[addPrincipalIdToRole][Added collection to existing array]")
                  return next(true);
                })
            }

          } else {

            console.log("NESSUN MAPPING TRA UTENTE E RUOLO", roleName)
            repositoryName = []
            collectionName = []
            if (kindOfMapping == 'collectionName') {
              console.log("kindOfMapping == 'collectionName")

              repositoryName.push({"name": access.repositoryName})
              collectionName.push({"name": access.collectionName})
              var payloadToCreate = {
                principalType: principalType,
                principalId: principalId,
                roleId: role.id,
                roleName: roleName,
                repositoryName: repositoryName,
                collectionName: collectionName
              }

            }
            if (kindOfMapping == 'repositoryName') {
              repositoryName.push({"name": access.repositoryName})
              console.log("kindOfMapping == 'repositoryName")
              var payloadToCreate = {
                principalType: principalType,
                principalId: principalId,
                roleId: role.id,
                roleName: roleName,
                repositoryName: repositoryName
              }
            }
            console.log("repositoryName", repositoryName)
            console.log("collectionName", collectionName)

            role.principals.create(
              payloadToCreate, function (err, principal) {

                if (err) {
                  console.log('[addPrincipalIdToRole][role.principals.create] Error', err);
                  return next(false);
                } else {
                  console.log("[addPrincipalIdToRole][Add new RoleMapping]", '')
                  return next(true);
                }
              })
          }
        })
      }
      else {
        console.log("[addPrincipalIdToRole]!Role");
        return next(false);
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
      var item_id = (!req.params.item_id ? null : req.params.item_id);
      var repository_name = req.params.repo_name
      var userId = accessToken.userId


      if (!userId) {
        return next(401)
      }
      console.log("USERID", userId);
      console.log("REQ", context.req.method)
      var method = context.req.method
      isAdmin(userId, function (hasAdminRole) {
        console.log("NEXT ADMIN", hasAdminRole)
        if (hasAdminRole) return next(200)
        else {
          if (method == 'GET') {
            if (collection_name != null) {
              console.log("app.RoleMap", app.RoleMap)
              console.log("Role getCollection", app.RoleMap['getCollection'])
              if (item_id != null) {
                roleId = app.RoleMap['getCollectionItem'].id
              } else roleId = app.RoleMap['getCollection'].id
              and = [
                {"repositoryName.name": repository_name},
                {"collectionName.name": collection_name},
                {"principalId": userId},
                {"roleId": roleId}
              ]
            }
            else {
              roleId = app.RoleMap['getRepository'].id
              and = [
                {"repositoryName.name": repository_name},
                {"principalId": userId},
                {"roleId": roleId}
              ]
            }

          }
          if (method == 'POST') {
            if (collection_name != null) {
              console.log("app.RoleMap", app.RoleMap)
              console.log("Role getCollection", app.RoleMap['getCollection'])
              roleId = app.RoleMap['populateCollection'].id
              and = [
                {"repositoryName.name": repository_name},
                {"collectionName.name": collection_name},
                {"principalId": userId},
                {"roleId": roleId}
              ]
            }
            else {
              roleId = app.RoleMap['createCollection'].id
              and = [
                {"repositoryName.name": repository_name},
                {"principalId": userId},
                {"roleId": roleId}
              ]
            }

          }
          var where = {
            where: {
              and: and
            }
          }
          console.log("WHERE:", JSON.stringify(where));
          app.models.RoleMapping.findOne(where, function (err, mapping) {
            if (err) throw err;
            console.log("Mapping:", mapping);
            if (mapping) return next(200)
            else return next(401)
          })


        }


        /*
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
         */

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
    removePrincipalIdFromRole: function removePrincipalIdFromRole(options,next) {
      console.log("Options:",options)
      var RoleMapping = app.models.RoleMapping;
/*
      RoleMapping.findOne({where: {
        "repositoryName.name":payload.access.repositoryName
        where: {
          "and": [{principalType: principalType},
            {principalId: principalId},
            {roleId: role.id}]
        }

      }})
*/


    },

    addPrincipalIdToRole: function addPrincipalIdToRole(roleName, principalType, principalId, access, next) {
      console.log("[addPrincipalIdToRole]", roleName + " " + principalId + " " + principalType)
      /*
       ISSUE
       The principleId field in
       the Rolemapping model is stored as a string in mongodb
       Delete the following
        principalId = (principalId).toString() if you plan to use relation db
       */

      principalId = (principalId).toString()

      if (access.repositoryName && access.collectionName) {

            addRoleMappingForRepositoryAndCollection(access, principalId, principalType, roleName, 'collectionName', function (mapping) {
              console.log("[1][Callback from addMapping For collectionName]", mapping)
              if (mapping)  return next(true);
              else return next(false)
            })
      }
      if (access.repositoryName && !access.collectionName) {
        addRoleMappingForRepositoryAndCollection(access, principalId, principalType, roleName, 'repositoryName', function (mapping) {
          console.log("[2][Callback from addMapping For repositoryName]", mapping)
          if (mapping) return next(true);
          else return next(false)
        })
      }
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
