/**
 * Created by Antonio Di Mariano on 13/10/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */

module.exports = function (app) {

  var Role = app.models.Role;
  var ACL = app.models.ACL;
  var loopback = require('loopback');
  var async = require('async')
  var logger = require("./logger");


  /**
   *
   * @param userId
   * @param next
   */
  var isAdmin = function (userId, next) {

    app.models.Role.findOne({where: {name: 'admin'}}, function (err, role) {

      if (role) {
        app.models.RoleMapping.findOne({
          where: {
            principalId: userId,
            roleId: role.id
          }
        }, function (e, mapping) {
          logger.debug("ADMIN MAPPING", mapping)
          if (mapping) {
            next(true)
          } else next(false)
        })
      } else {
        next(false)
      }
    })
  }

  /**
   *
   * @param str
   * @param strArray
   * @returns {boolean}
   */
  var searchStringInArray = function searchStringInArray(str, strArray) {
    for (var j = 0; j < strArray.length; j++) {
      if (strArray[j].name == str) return true;
    }
    return false;
  }
  /**
   *
   * @param access
   * @param principalId
   * @param principalType
   * @param roleName
   * @param kindOfMapping
   * @param next
   */
  var addRoleMappingForRepositoryAndCollection = function (access, principalId, principalType, roleName, kindOfMapping, next) {

    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;
    app.models.Role.findOne({where: {'name': roleName}}, function (err, role) {
      if (err) {
        logger.debug('Role.findOne Error', err);
        next(false);
      }
      if (role) {

        // logger.debug("------------------------------------ ")
        // logger.debug("[Role.id]:", role.id)
        //  logger.debug("[Role.name]:", role.name)
        // logger.debug("[principalType]:", principalType)
        // logger.debug("[principalId]:", principalId)
        // logger.debug("------------------------------------ ")


        RoleMapping.findOne({
          where: {
            "and": [{principalType: principalType},
              {principalId: principalId},
              {roleId: role.id}]
          }
        }, function (e, mapping) {
          if (mapping) {

            logger.debug("[addRoleMappingForRepositoryAndCollection][kindOfMapping]: ", kindOfMapping)
            logger.debug("[[addRoleMappingForRepositoryAndCollection]][Found Mapping for ", mapping.roleName + "]");
            if (kindOfMapping == 'collectionName') {
              var arrayToScan = mapping.collectionName
              var valueToPush = access.collectionName
              mapping.repositoryName.push({"name": access.repositoryName})
            }
            if (kindOfMapping == 'repositoryName') {
              var arrayToScan = mapping.repositoryName
              var valueToPush = access.repositoryName
            }
            // it searches for duplicate values
            var result = searchStringInArray(valueToPush, arrayToScan)
            if (result) {
              logger.debug("[addRoleMappingForRepositoryAndCollection][Find Duplicate for ", valueToPush + " ]")
              return next(false)
            }
            else {
              arrayToScan.push({"name": valueToPush})
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
                    logger.error('[addRoleMappingForRepositoryAndCollection][Error while Adding collection to existing array] Error', err);
                    return next(false);
                  }
                  logger.debug("[addRoleMappingForRepositoryAndCollection][Added collection to existing array]")
                  return next(true);
                })
            }

          } else {

            logger.debug("[addRoleMappingForRepositoryAndCollection][Going to add new role]", roleName)
            repositoryName = []
            collectionName = []
            if (kindOfMapping == 'collectionName') {
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
              var payloadToCreate = {
                principalType: principalType,
                principalId: principalId,
                roleId: role.id,
                roleName: roleName,
                repositoryName: repositoryName
              }
            }

            role.principals.create(
              payloadToCreate, function (err, principal) {

                if (err) {
                  logger.error('[addRoleMappingForRepositoryAndCollection][role.principals.create] Error', err);
                  return next(false);
                } else {
                  logger.debug("[addRoleMappingForRepositoryAndCollection][New Role has been Added]")
                  return next(true);
                }
              })
          }
        })
      }
      else {
        logger.debug("[addRoleMappingForRepositoryAndCollection]!Role");
        return next(false);
      }
    })
  }


  return {


    /**
     *
     * @param context
     * @param next
     * @returns {*}
     */

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
      var method = context.req.method
      isAdmin(userId, function (hasAdminRole) {
        logger.debug("[isAllowed][user ha admin role?]", hasAdminRole)
        if (hasAdminRole) return next(200)
        else {
          if (method == 'GET') {
            if (collection_name != null) {
              logger.debug("[isAllowed][app.RoleMap]", app.RoleMap)
              logger.debug("[isAllowed][Role getCollection]", app.RoleMap['getCollection'])
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
              logger.debug("[isAllowed][app.RoleMap]", app.RoleMap)
              logger.debug("[isAllowed][Role getCollection]", app.RoleMap['getCollection'])
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
          app.models.RoleMapping.findOne(where, function (err, mapping) {
            if (err) throw err;
            if (mapping) return next(200)
            else return next(401)
          })
        }
      })
    },
    /**
     *
     * @param roleName
     * @param next
     */
    createRole: function createRole(roleName, next) {

      logger.debug("roleName", roleName);
      app.models.Role.findOne({'name': roleName}, function (err, role) {
        if (err) {
          logger.error('[createRole][Role.findOne Error]', err);
          next(false);
        }
        if (role) {
          logger.debug("[createRole] Role is already created")
          next(false)
        } else {
          app.models.Role.create({
            name: roleName
          }, function (err, role) {
            if (err) throw err;
            logger.debug('[createRole][Role.createad] : ', role);
            next(true);
          });
        }
      })
    },

    /**
     * todo: to be implemented
     * @param options
     * @param next
     */
    removePrincipalIdFromRole: function removePrincipalIdFromRole(options, next) {

      return next()

    },
    /**
     *
     * @param roleName
     * @param principalType
     * @param principalId
     * @param access
     * @param next
     */
    addPrincipalIdToRole: function addPrincipalIdToRole(roleName, principalType, principalId, access, next) {
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
          logger.debug("--[1][Callback from addMapping For collectionName]", roleName)
          if (mapping)  return next(true);
          else return next(false)
        })
      }
      if (access.repositoryName && !access.collectionName) {
        addRoleMappingForRepositoryAndCollection(access, principalId, principalType, roleName, 'repositoryName', function (mapping) {
          logger.debug("--[2][Callback from addMapping For repositoryName]", roleName)
          if (mapping) return next(true);
          else return next(false)
        })
      }
    }
  }
}
