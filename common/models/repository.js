/**
 * created by Antonio Di Mariano on 6/6/2015
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
module.exports = function (Repository) {


  var fs = require('fs');
  var https = require('https');
  var path = require('path');
  var request = require('request');
  var service = require('../service/persist');
  var logger = require("../helpers/logger");
  var app = require('../../server/server.js');
  var loopback = require('loopback');
  var async = require('async');
  var loadModel = require('../helpers/loadModel');
  var modelRelation = require("../helpers/modelRelation");
  var modelACL = require("../helpers/modelACL")
  var _modelRelation = new modelRelation(app);
  var _loadModel = new loadModel(app);
  var _modelACL = new modelACL(app);
  var isStatic = true;
  


  /*
   Disable GET /api/repositories/myrepo/1 in order to allow
   GET /api/repositories/myrepo/collection
   */

  Repository.disableRemoteMethod('findById', isStatic);
  Repository.disableRemoteMethod('updateAttributes', false);//it is necessary in order to enable the 'editRepository' method
  Repository.disableRemoteMethod('deleteById', true); //it is necessary in order to enable the 'deleteRepository' method

  var repository_json = require('./repository.json')
  var config_data = require('../../server/config.json')
  var api_prefix = config_data.restApiRoot + '/' + repository_json.plural


  /**
   *
   * @param code
   * @param msg
   * @returns {Error}
   */

  var sendError = function (code, msg) {

    var error = new Error();
    error.statusCode = code;
    error.message = msg
    delete error.stack;
    return error;
  }


  /* --- Repository -----*/
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.getRepository = function (req, res, next) {
    _loadModel.buildRepositoryModel(req, res, function (model) {
      if (model) {
        logger.debug("[Repository.buildRepositoryModel]", app.repositoryModel.definition.name)
        console.log("sksks");
        var fields = {
          fields: {name: true, tablename: true, path: true}
        }
        if (req.query.filter) {
          var query_filters = JSON.parse((JSON.stringify(fields) + JSON.stringify(req.query.filter)).replace(/}{/g, ","));
        } else
          var query_filters = JSON.parse((JSON.stringify(fields)).replace(/}{/g, ","));

        app.repositoryModel.find(query_filters, function (err, instance) {
          if (err) {
            return res.status(500).send({error: err})
          }
          if (!instance) {
            return res.status(404).send({error: "Repository not Found"})
          }
          if (instance) {
            next(null, instance)
            //  return res.status(200).send(instance);
          }
        })
      } else return res.status(404).send({message: "The repository model does not exists"})
    })
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.editRepository = function (req, res, next) {

    app.models.Repository.findOne({where: {name: req.params.repo_name}}, function (err, repo) {
      if (err) return res.status(500).send({error: err});
      if (!repo) return res.status(404).send({"message": "Repository not found"});
      repo.updateAttributes(req.body, function (err) {
        return res.status(200).send({message: 'repository updated'})
      })
    })
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */

  Repository.deleteRepository = function (req, res, next) {

    logger.debug("[deleteRepository]: ", req.params.repo_name)
    app.models.Repository.findOne({where: {name: req.params.repo_name}}, function (err, repo) {
      if (err) return res.status(500).send({error: err});
      if (!repo) {
        app.models[req.params.repo_name] = null;
        return res.status(404).send({"message": "repository not found"});
      }
      app.models.Repository.destroyById(repo.id, function (err) {
        if (err) return res.status(500).send({error: err});
        req.params.pathToDelete = req.params.repo_name;
        next()
      })
    })
  }

  /* ----------------------------------------  Collections ------------------------------------------------*/
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.getCollectionCount = function (req, res, next) {
	logger.debug("[Repository.getCollectionCount]", req.query.filter)
    _loadModel.buildCollectionModel(req, res, function (next) {
      if (!next) return res.status(500).send({message: "getCollection Error"})
      if (app.next_module) {
      	app.next_module.count(null, function(err, count) {
			  if (err) return res.status(500).send({"error": err});
			  return res.json({
				  "total": count
			  });
		  });
      } else {
        return res.status(404).send({"message": "the collection model does not exists"});
      }

    })
  }



  Repository.getCollection = function (req, res, next) {

    logger.debug("[Repository.getCollection]", req.query.filter)
    _loadModel.buildCollectionModel(req, res, function (next) {
      if (!next) return res.status(500).send({message: "getCollection Error"})
      if (app.next_module) {
      	if (req.query.include_count == "true") {
      		console.log("calculating count number", req.query.filter.where);
      		//console.log("condition", req.query.filter.where);
      		app.next_module.count(req.query.filter.where, function(err, count) {
				if (err) return res.status(500).send({"error": err});
        	  	app.next_module.find(req.query.filter, function (err, instance) {
          			if (err) return res.status(500).send({"error": err});
          			if (!instance) return res.status(404).send({"message": "collection not found"});
          			return res.json({
          				"total": count,
          				"data": instance
          			});
        		});
		  });      		
		} else {
		 	app.next_module.find(req.query.filter, function (err, instance) {
          		if (err) return res.status(500).send({"error": err});
          		if (!instance) return res.status(404).send({"message": "collection not found"});
          		return res.json(instance);
        	});
		}
      } else {
        return res.status(404).send({"message": "the collection model does not exists"});
      }

    })
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.editCollectionBody = function (req, res, next) {

    logger.debug("[Repository.editCollectionBody]", req.query.filter)
    _loadModel.buildCollectionModel(req, res, function (next) {
      if (!next) return res.status(500).send({message: "getCollection Error"})
      app.next_module.findById(req.body.id, function (err, instance) {
        if (err) return res.status(500).send({"error": err});
        if (!instance) return res.status(404).send({"message": "Collection not found"});
        instance.updateAttributes(req.body, function (err) {
          return res.status(200).send({message: "Collection updated"})
        })
      })
    })
  }
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.deleteCollection = function (req, res, next) {

    logger.debug("[Repository.deleteCollection]", req.params.collection_name)
    _loadModel.buildRepositoryModel(req, res, function (callback) {
      if (!callback) return res.status(500).send({message: "getCollection Error"})
      app.repositoryModel.findOne({where: {name: req.params.collection_name}},
        function (err, instance) {
          if (err) return res.status(500).send({error: err});
          if (!instance) return res.status(404).send({message: "Collection not found"});
          instance.destroy(function (err) {
            if (err) return res.status(500).send({error: "Instance destroy error"})
            else {
              next()
            }
          })
        })
    })
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */
  Repository.getCollectionSchema = function (req, res, next) {
    logger.debug("[Repository.getCollectionSchema]");
    return res.json(app.next_module.definition.properties);
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */
  Repository.createCollection = function (req, res, next) {
    return res.status(201).send({message: "The collection was successfully created "})
  }
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.populateCollection = function (req, res, next) {
    //return res.status(200).send;
  }
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.getCollectionItem = function (req, res, next) {
  }
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.editCollectionItem = function (req, res, next) {
  }


  /*------------------------------------------------------- Relations btw Models --------------------------------------*/

  Repository.createRelation = function (req, res, next) {

    app.repositoryModel.findOne({where: {name: req.params.collection_name}},
      function (err, instance) {

        if (err) res.sendStatus(500);
        if (!instance) return res.status(404).send({"error": "Collection not found"});
        var relation_array = (!instance.relatedTo ? [] : instance.relatedTo)
        logger.debug("[Repository.createRelation]", relation_array);
        _loadModel.checkduplicate(relation_array, app.relationbody, function (duplicate) {
          if (duplicate) return res.status(409).send({"error": "Relation " + app.relationbody.relatedCollection + " is already defined"})
          else {
            relation_array.push(app.relationbody)
            var relatedTo = {"relatedTo": relation_array}
            instance.updateAttributes(relatedTo, function (err) {
              if (err) return res.status(500).send({"error": "Error during updating attributes"})
              else {
                logger.debug("[Repository.createRelation][updateAttribute on = ", instance.path + "of Repository Model " + app.repositoryModel.definition.name);
                return res.status(201).send({"message": "Relation Created"})
              }
            })
          }
        })
      })
  }
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.getRelation = function (req, res, next) {

    logger.debug("[Repository.getRelation][app.first_model]", app.first_model.definition.name)
    app.first_model.findById(req.params.item_id,
      {include: app.relationName},
      function (err, instance) {
        if (err) {
          logger.error("[Repository.getRelation][Relation Query Error]:", err);
        }
        if (!instance) return res.sendStatus(404);
        return res.json(instance);
      })
  }


  /*----------------------------------------- Replicas-------------------------------------------------------------------*/

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */
  Repository.createReplica = function (req, res, next) {

    var Replica = app.models.Replica;
    var repositoryDB = app.dataSources.repoDB;
    if (!req.params) {
      return res.sendStatus(400);
    }
    app.models.Repository.findOne({where: {"name": req.params.repo_name}}, function (err, repodata) {

      if (err) throw err;
      var uri = ((repodata.default_storage && repodata.default_storage.baseURL) ? repodata.default_storage.baseURL + '/' + req.body.filename : req.body.uri)
      var type = ((repodata.default_storage && repodata.default_storage.type) ? repodata.default_storage.type : req.body.type)

      if (!uri || !type || !req.body.filename) {
        return res.sendStatus(400);
      }
      var payload = {
        "uri": uri,
        "type": type,
        "filename": req.body.filename,
        "repository": req.params.repo_name,
        "collection": req.params.collection_name,
        "itemId": req.params.item_id,
        "name": "replica"
      }

      Replica.create(payload, function (err, instance) {
        if (err) return res.status(500).send({message: err});
        return res.status(200).send(instance);
      })
    })
  }


  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.getReplicas = function (req, res, next) {

    app.models.Replica.find({
      where: {
        "repository": req.params.repo_name,
        "collection": req.params.collection_name,
        "itemId": req.params.item_id
      }, fields: {
        uri: true, filename: true, type: true, id: true
      }
    }, function (err, replicas) {
      if (err) return res.status(500).send({message: err});
      if (!replicas) return res.status(404).send({message: "Replica not found"});
      return res.json(replicas);
    })
  }


  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.getReplicaById = function (req, res, next) {

    var Replica = app.models.Replica;
    Replica.findById(req.params.replica_id,
      {
        fields: {uri: true, filename: true, type: true}
      },
      function (err, replica) {
        if (err) return res.status(500).send({message: err});
        if (!replica) return res.status(404).send({message: "Replica not found"});
        var uri = replica.uri;
        logger.debug("[Repository.getReplicaById][URI]:", uri);
        var url = getTempURL(uri, 'GET');
	logger.debug("[Repository.getReplicaById][URL]:", url);
        if (!url.error) {
          return res.redirect(url.url);
        } else return res.status(404).send({message: 'Account or Object not found'});
      })
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.uploadReplicaById = function (req, res, next) {
    var Replica = app.models.Replica;
    Replica.findById(req.params.replica_id,
      {
        fields: {uri: true, filename: true, type: true}
      },
      function (err, replica) {
        if (err) return res.status(500).send({message: err});
        if (!replica) return res.sendStatus(404);
        var uri = replica.uri;
        logger.debug("[ Repository.uploadReplicaById][URI]: ", uri);
        var url = getTempURL(uri, 'PUT');
        if (!url.error) {
          return res.status(200).send({uploadURI: url.url})
        } else return res.status(404).send({message: 'Account or Object not found'});
      })
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.deleteReplicaById = function (req, res, next) {

    var Replica = app.models.Replica;

    var request = require('request');

    Replica.findById(req.params.replica_id,
      {
        fields: {uri: true, filename: true, type: true}
      },
      function (err, replica) {
        if (err) return res.status(500).send({message: err});
        if (!replica) return res.status(404).send({message: "Replica not found"});
        var uri = replica.uri;
        logger.debug("[Repository.deleteReplicaById][URI]: ", uri);
        var url = getTempURL(uri, 'DELETE');
        logger.debug("[Repository.deleteReplicaById][DELETE-URL] :", url.error)
        if (url.error == 0) {
          logger.debug("[Repository.deleteReplicaById][req.params.replica_id]", req.params.replica_id);
          request.del(url.url, function (err, response, body) {

              if (!err && response.statusCode == '204' || req.body.force) {
                Replica.destroyById(req.params.replica_id, function (err, replica) {
                  if (err) return res.status(500).send({error: err})
                  logger.debug("Count:", replica.count)
                  if (replica.count > 0)
                    return res.status(200).send({message: "Replica [ " + req.params.replica_id + " ] has been removed"})
                })
              }
              else {
                return res.status(response.statusCode).send(body)
              }
            }
          )
        }
        else
          return res.status(404).send({message: 'Account or Object not found'});
      }
    )
  }

  /**
   *
   * @param uri
   * @param method
   * @returns {*}
   */

  var getTempURL = function (uri, method) {
    var url = require('url');
    var crypto = require('crypto');
    var utf8 = require('utf8');
    var swift_storage = require('../../server/datasources.json')
    var keys = swift_storage.swift_storage.keys
    var expirationTimeInSeconds = swift_storage.swift_storage.expirationTimeInSeconds;

    var storage_parts = url.parse(uri);
    var host = storage_parts.host;
    var path = decodeURI(storage_parts.pathname);
    logger.debug("[getTempURL][host]", host);
    logger.debug("[getTempURL][path]", path);
    logger.debug("[getTempURL][expirationInSec]", expirationTimeInSeconds);
    //logger.debug(req.params);
    //logger.debug(req.method);
    //logger.debug(req.route);

    var expires = Math.floor(Date.now() / 1000) + expirationTimeInSeconds;
    logger.debug("[getTempURL][expires At]", expires);
    if (path[0] != '/') {
      path = '/' + path;
    }
    var pathParts = path.split('/', 5);
    //logger.debug(pathParts);
    if (pathParts.length != 5 || pathParts[0] || pathParts[1] != 'v1' || !pathParts[2] || !pathParts[3] || pathParts[4] == '/') {
      return {
        error:400,
        message:"WARNING: " + path + " does not refer to a Swift Object (e.g. /v1/account/container/object"
      }

    }
    var account = pathParts[2];
    if (keys[account]) {
      var body = utf8.encode(method + '\n' + expires + '\n' + path);
      var hash = crypto.createHmac('sha1', keys[account]).update(body).digest('hex');
      var tmp_uri = 'http://' + host + path + '?temp_url_sig=' + hash + '&temp_url_expires=' + expires;
      return {
        url: tmp_uri,
        error: 0
      };
    } else {
      return {
        error: 404,
        url: ''
      };
    }
  }


  /*------------------------------------------------------------------- ACL ----------------------------------------*/

  /**
   *
   * @param body
   * @param next
   * @returns {*}
   */
  var validateGrantAccessBody = function (body, next) {
    if (!body.permissions || !body.username) {
      return next({
        "validate": false
      })
    }
    app.models.User.findOne({where: {"username": body.username}}, function (err, user) {
      if (err) {
        return next({
          "validate": false
        })
      }
      if (user) {
        return next({
          "validate": true,
          userId: user.id
        })
      }
      if (!user) {
        return next({
          "validate": false
        })
      }
    })
  }

  /**
   *
   * @param array
   * @param property
   * @param value
   */
  function findAndRemove(array, property, value) {
    var oldarray = array;
    array.forEach(function (result, index) {
      if (result[property] === value) {
        //Remove from array
        array.splice(index, 1);
      }
    });
    return oldarray.length != array.length
  }

  /**
   * Todo: Don't use. To be completed
   * @param payload
   * @param label
   * @param next
   */
  var removePermissionsToUser = function (payload, label, next) {

    var RoleMapping = app.models.RoleMapping;
    var _ = require('underscore')
    logger.debug("payload", payload)
    payload.kind = label

    RoleMapping.find({
      where: {
        "and": [
          {"repositoryName.name": payload.repo_name},
          {"collectionName.name": payload.collection_name},
          {"principalId": payload.userId}
        ]
      }
    }, function (err, mappers) {

      mappers.forEach(function (mapper) {

        var removed_status_1 = findAndRemove(mapper.repositoryName, 'name', payload.repo_name);
        var removed_status_2 = findAndRemove(mapper.collectionName, 'name', payload.collection_name);
        logger.debug("[removePermissionsToUser][status_1]: ", removed_status_1);
        logger.debug("[removePermissionsToUser][status_2]: ", removed_status_2);

      })
      mappers.forEach(function (mapper) {

        RoleMapping.update(mapper, function (err, result) {
          if (err) throw err;
          logger.debug("result:", result)
        })

      })
    })
    _modelACL.removePrincipalIdFromRole(payload, function (callback) {
      logger.debug("[removePermissionToUser]", callback)
    })

  }

  /**
   *
   * @param source
   * @param label
   * @param next
   */

  var setPermissionsToUser = function (source, label, next) {
    var RoleMapping = app.models.RoleMapping;

    var permissions = source.permissions
    logger.debug("[setPermissionsToUser][PERMISSION]", label + permissions)
    if (permissions.length > 1) {

      async.parallel([
        function (callback) {
          var options = {
            userId: source.userId,
            permission: label + permissions[0],
            endpoints: source.access
          }
          processRoleforEachPermission(options, function (next) {
            logger.debug("[setPermissionsToUser][1A][Callback from processRole]:", next);
            callback(null, next)
          })
        },
        function (callback) {
          var options = {
            userId: source.userId,
            permission: label + permissions[1],
            endpoints: source.access
          }
          processRoleforEachPermission(options, function (next) {
            logger.debug("[setPermissionsToUser][2A][Callback from processRole]:", next);
            callback(null, next)
          })

        }
      ], function (err, results) {
        logger.debug("-------------------------------------------------------")
        logger.debug("[setPermissionsToUser][END ASYNC PARALLEL]", err, results)
        logger.debug("-------------------------------------------------------")
        if (!err && results[0] != false || results[1] != false) return next(true)
        else return next(false);

      })
    } else {
      var options = {
        permission: label + permissions,
        endpoints: source.access,
        userId: source.userId
      }
      processRoleforEachPermission(options, function (cb) {
        logger.debug("[setPermissionsToUser][3A] Callback from processRole", cb);
        if (cb) {
          return next(true)
        } else next(false)
      })
    }
  }

  /**
   *
   * @param options
   * @param next
   */
  var processRoleforEachPermission = function (options, next) {
    var RoleMapping = app.models.RoleMapping;
    var permission = options.permission;
    var endpoints = options.endpoints;
    var userId = options.userId;

    console.log("OPTONS:", options);

    logger.debug("**[processRoleforEachPermission][label + permissions]", app.PropertiesMap[permission])

    if (app.PropertiesMap[permission].length) {
      logger.debug("**[processRoleforEachPermission][Ruoli multipli da assegnare]")
      properties_lenght = app.PropertiesMap[permission].length
      value = app.PropertiesMap[permission];
      var count = 0;
      async.forEach(value, function (roleName, callback) {
        logger.debug("**[processRoleforEachPermission][roleName]:", roleName.property)
        _modelACL.addPrincipalIdToRole(roleName.property,
          RoleMapping.USER, userId, endpoints, function (cb) {
            logger.debug("**[processRoleforEachPermission][Callback [A] from addPrincipalIdToRole][roleName]", roleName.property, cb);
            count = count + 1;
            callback(cb)
          })
      }, function (value) {
        if (!value) {
          return next(false);
        } else return next(true)
      });

    } else {
      logger.debug("**[processRoleforEachPermission][Ruolo Singolo da Assegnare]");
      roleName = app.PropertiesMap[permission];
      console.log("ROLENAME:", roleName);
      console.log("roleName.property:", roleName.property);
      console.log("userId:", userId);
      console.log("endpoints:", endpoints);


      _modelACL.addPrincipalIdToRole(roleName.property,
        RoleMapping.USER, userId, endpoints, function (cb) {
          logger.debug("**[processRoleforEachPermission][Callback [B] from addPrincipalIdToRole]", cb);
          return next(cb);
        })
    }
  }


  /**
   * @param req
   * @param res
   * @param next
   * @constructor
   */
  Repository.SetACLtoRepository = function (req, res, next) {
    logger.debug("[SetACLtoRepository]", req.body);
    validateGrantAccessBody(req.body, function (isvalidate) {
      if (!isvalidate.validate) return res.status(400).send({message: 'Bad payload'})
      {
        var payload = {
          "userId": isvalidate.userId,
          "permissions": req.body.permissions,
          "access": {
            "repositoryName": req.params.repo_name
          }
        }
        console.log("PAYLOAD: ", payload);
        setPermissionsToUser(payload, 'Repo', function (permission) {
          if (permission) {
            logger.debug("PERMISSION:", permission);
            return res.status(200).send({message: "ACL has been added"});
          } else {
            return res.status(409).send({message: "ACL is already exists"});
          }
        })
      }
    })
  }


  /**
   * Assegno all'utente i permessi SOLO per la collection in req.params.collection_name
   * @param req
   * @param res
   * @param next
   * @constructor
   */
  Repository.SetACLtoCollection = function (req, res, next) {
    logger.debug("grantAccess", req.body);
    validateGrantAccessBody(req.body, function (isvalidate) {
      if (!isvalidate.validate) return res.status(400).send({message: 'Bad payload'})
      var payload = {
        "userId": isvalidate.userId,
        "permissions": req.body.permissions,
        "access": {
          "repositoryName": req.params.repo_name,
          "collectionName": req.params.collection_name
        }
      }
      logger.debug("payload", payload);
      if (req.body.items_permissions) {
        async.parallel([
          function (callback) {
            setPermissionsToUser(payload, 'Coll', function (permission) {
              if (permission) {
                callback(null, true)
              } else callback(null, false)
            })
          },
          function (callback) {
            logger.debug("[SetACLtoCollection][items_permissions]: ", req.body.items_permissions);
            var payload = {
              "userId": isvalidate.userId,
              "permissions": req.body.items_permissions,
              "access": {
                "repositoryName": req.params.repo_name,
                "collectionName": req.params.collection_name
              }
            }
            setPermissionsToUser(payload, 'Item', function (permission) {
              if (permission) {
                callback(null, true)
              } else callback(null, false)
            })
          }
        ], function (err, results) {
          logger.debug("[SetACLtoCollection][END ASYNC PARALLEL]", results[0], results[1])
          if (results[0] && results[1]) {
            logger.debug("ACLs created")
            return res.status(200).send({message: "ACLs created"});
          }
          if (!results[0] && !results[1]) {
            logger.debug("ACLs are already exists")
            return res.status(409).send({message: "ACLs are already exists"});
          }
          if (results[0] && !results[1]) {
            return res.status(200).send({message: "ACL for collection [" + req.params.collection_name + "] has been added"});
          }
          if (!results[0] && results[1]) {
            return res.status(200).send({message: "ACL for collection [" + req.params.collection_name + "] ITEMS has been added"});
          }
        })

      } else {
        setPermissionsToUser(payload, 'Coll', function (permission) {
          if (permission) {
            return res.status(200).send({message: "ACL has been added"});
          } else {
            return res.status(409).send({message: "ACL is already exists"});
          }
        })
      }

    })

  }

  /**
   * todo: To be completed
   * @param req
   * @param res
   * @param next
   * @constructor
   */
  Repository.RemoveACLtoCollection = function (req, res, next) {

    logger.debug("RemoveACLtoCollection", req.body)
    logger.debug("RemoveACLtoCollection", req.params.repo_name)
    logger.debug("RemoveACLtoCollection", req.params.collection_name)

    app.models.User.findOne({where: {"username": req.body.username}}, function (err, user) {
      if (!user) return res.status(400).send({message: 'Bad payload'})
      var payload = {
        "userId": user.id,
        "repo_name": req.params.repo_name,
        "colletion_name": req.params.collection_name

      }
      logger.debug("payload", payload);
      removePermissionsToUser(payload, 'Coll', function (permission) {
        logger.debug("Removed Permission:", permission)
      })
    })


  }

  /**
   *
   * @param req
   * @param res
   * @param next
   * @constructor
   */
  Repository.ListACLforRepositories = function (req, res, next) {

    var User = app.models.user;
    app.models.RoleMapping.find(
      {where: {"repositoryName.name": req.params.repo_name}},
      {
        fields: {
          roleName: true,
          principalId: true,
          repositoryName: true,
          collectionName: true
        }
      }, function (err, acls) {
        var roleMappedTo = []
        async.forEach(acls, function (acl, callback) {
          User.findById(acl.principalId, function (err, user) {
            roleMappedTo.push({
              "username": user.username,
              "roleName": acl.roleName,
              "repositoriesName": acl.repositoryName,
              "collectionsName": acl.collectionName
            })
            callback()
          })
        }, function () {
          return res.status(200).send({"acls": roleMappedTo})
        });
      })
  }


  /**
   *
   * @param req
   * @param res
   * @param next
   * @constructor
   */
  Repository.ListACLforCollections = function (req, res, next) {

    var User = app.models.user;
    app.models.RoleMapping.find(
      {
        where: {

          "and": [
            {"repositoryName.name": req.params.repo_name},
            {"collectionName.name": req.params.collection_name}
          ]
        }
      },
      {
        fields: {
          roleName: true,
          principalId: true,
          repositoryName: true,
          collectionName: true
        }
      }, function (err, acls) {
        var roleMappedTo = []
        async.forEach(acls, function (acl, callback) {
          User.findById(acl.principalId, function (err, user) {
            roleMappedTo.push({
              "username": user.username,
              "roleName": acl.roleName,
              "repositoriesName": acl.repositoryName,
              "collectionsName": acl.collectionName
            })
            callback()
          })
        }, function () {
          return res.status(200).send({"acls": roleMappedTo})
        });
      })
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.getACLsByusername = function (req, res, next) {

    app.models.User.find({where: {"username": req.params.acls_for_user}}, function (err, access) {
      //app.models.access.find({where: {"repositoryName": req.params.repo_name}},{include:'users'}, function (err, access) {
      if (err) {
        return res.setatus(500).send({error: err})
      }
      if (access.length == 0) {
        return res.setatus(404).send({message: "USER NOT FOUND"})
      }
      var where = {};
      if (req.params.repo_name && req.params.collection_name) {
        where = {
          "and": [
            {"repositoryName.name": req.params.repo_name},
            {"collectionName.name": req.params.collection_name},
            {"principalId": access[0].id}
          ]
        }
      } else {
        where = {
          "and": [
            {"repositoryName.name": req.params.repo_name},
            {"principalId": access[0].id}
          ]
        }
      }
      app.models.RoleMapping.find(where, function (err, mapping) {
        if (err) {
          return res.status(500).send({error: err})
        }
        var roleMappedTo = []
        var l = mapping.length
        var count = 0;
        async.forEach(mapping, function (map, callback) {
          app.models.Role.findById(map.roleId, function (err, role) {
            roleMappedTo.push({
              "RoleName": role.name,
              "MappingId": map.id,
              "Repositories": map.repositoryName,
              "Collections": map.collectionName
            })
            count = count + 1;
            if (count == l) {
              return res.status(200).send({"acls": access, "mapping": roleMappedTo})
            }
          })
        }, function () {
          return res.status(200).send({"acls": access, "mapping": roleMappedTo})
        });
      })
    })
  }


  /*---------------------------------------------- beforeRemote Hooks------------------------------------------------------*/

  Repository.beforeRemote('getRepository', function (context, user, final) {
    var res = context.res;
    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        logger.debug("[getRepository][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to access this repository"})
      }
      if (allowed == 500) {
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        return final()
      }
    })
  })


  Repository.afterRemote('getRepository', function (context, data, final) {
    var length = data.length;
    var ctx = loopback.getCurrentContext();
    var accessToken = ctx.get('accessToken');

    for (var i = 0; i < length; i++) {
      if (data[i].collection_db) {
        data[i].collection_db.password = "********"
      }
      var path = data[i].path
      data[i].path = api_prefix + path;
    }
    return final()
  })


  Repository.beforeRemote('editRepository', function (context, user, final) {

    var res = context.res;
    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        logger.debug("[editRepository][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to edit this repository"})
      }
      if (allowed == 500) {
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        return final()
      }
    })
  })

  /**
   * DELETE REPOSITORY
   */
  Repository.afterRemote('deleteRepository', function (context, user, final) {
    var req = context.req;
    var res = context.res;

   // remote the repository model from app.models[modelName]
    _loadModel.removeModel(req, res, function (cb) {
      if (!cb) {
        logger.error("[afterRemote-deleteRepository][callback false] ")
      }
      return res.status(200).send({message: "The repository [" + req.params.repo_name + "] has been removed"})
    })


  })

  /**
   * DELETE COLLECTION
   */
  Repository.afterRemote('deleteCollection', function (context, user, final) {
    var req = context.req;
    var res = context.res;

    _loadModel.buildCollectionModel(req, res, function (next) {
      _loadModel.removeModel(req, res, function (cb) {
        if (!cb) {
          logger.error("[afterRemote-deleteRepository] ")
        }
        return res.status(200).send({message: "The collection [" + req.params.collection_name + "] has been removed"})
      })
    })
  })

  Repository.beforeRemote('deleteRepository', function (context, user, final) {

    var res = context.res;
    var req = context.req;

    logger.debug("[Repository.beforeRemote][deleteRepository]", req.body.force)

    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        logger.debug("[deleteRepository][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to delete this repository"})
      }
      if (allowed == 500) {
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        _loadModel.buildRepositoryModel(req, res, function (next) {
          if (next) {
            app.repositoryModel.findOne(function (err, value) {
              if (err) res.status(500).send({error: err})
              if (!value || (req.body && req.body.force))
                return final()
              else {
                return res.status(403).send({message: "The repository still has collections"})
              }
            })
          } else res.status(404).send({message: "repository not found"})
        })
      }
    })
  })


  Repository.beforeRemote('createCollection', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    var loopback = require('loopback');
    var ctx = loopback.getCurrentContext();
    // Get the current access token
    var accessToken = ctx.get('accessToken');
    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        logger.debug("[createCollection][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to access this collection"})
      }
      if (allowed == 500) {
        logger.debug("[createCollection][Status 500]")
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        // validate Body
        _loadModel.validatebody(req, res, function (cb) {
          if (cb) {
            // buildRepositoryModel Model
            _loadModel.buildRepositoryModel(req, res, function (next) {
              if (next) {
                // check for duplicate
                app.repositoryModel.findOne({where: {"name": req.body.name}}, function (err, value) {
                  if (err) return res.send(JSON.stringify(err));
                  if (value) return res.status(409).send({error: "A collection named " + req.body.name + " is already defined"})
                  // get DataSource
                  _loadModel.getDatasourceToWrite(req, res, function (next) {
                    // create Model and save to localdb
                    app.repositoryModel.create(app.bodyReadToWrite, function (err, instance) {
                      if (err) return res.send(JSON.stringify(err));
                      // create collection table reponame_collection
                      service.createTable(app.CollectionDataSource, app.bodyReadToWrite, function (callback) {
                        if (callback) return final()
                        else return res.status(500).send({error: "service.createTable error"});
                      })
                    })
                  })
                })
              }
            })
          }
        })
      }
    })
  })

  Repository.beforeRemote('getCollection', function (context, user, final) {

    var res = context.res;


    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        logger.debug("[getCollection][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to access this collection"})
      }
      if (allowed == 500) {
        logger.debug("[getCollection][Status 500]")
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        return final()
      }
    })
  })

  Repository.beforeRemote('editCollectionBody', function (context, user, final) {
    var res = context.res;
    var req = context.req;

    if (!req.body || !req.body.id) {
      logger.debug("[editCollectionBody][Status 401 Unauthorized]")
      return res.status(400).send({"error": "id empty or not found"})

    }
    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        logger.debug("[editCollectionBody][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to edit this collection"})
      }
      if (allowed == 500) {
        logger.debug("[editCollectionBody][Status 500]")
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        return final()
      }
    })
  })

  Repository.beforeRemote('deleteCollection', function (context, user, final) {
    var res = context.res;
    var req = context.req;

    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        logger.debug("[deleteCollection][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to remove this collection"})
      }
      if (allowed == 500) {
        logger.debug("[deleteCollection][Status 500]")
        res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {

        _loadModel.buildCollectionModel(req, res, function (next) {
          app.next_module.findOne(function (err, item) {
            if (err) return res.sendStatus(500);
            if (!item || req.body && req.body.force) return final();
            else {
              return res.status(403).send({message: "The collection still has items"})
            }
          })
        })
      }
    })
  })

  Repository.beforeRemote('getCollectionItem', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        logger.debug("[getCollectionItem][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to access this collection"})
      }
      if (allowed == 500) {
        logger.debug("[getCollectionItem][Status 500]")
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        _loadModel.buildCollectionModel(req, res, function (next) {
          app.next_module.findById(req.params.item_id, function (err, item) {
            if (err) return res.sendStatus(500);
            if (!item) return res.sendStatus(404);
            else {
              return res.status(200).send(item);
            }
          })
        })
      }
    })
  })
  Repository.beforeRemote('editCollectionItem', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        logger.debug("[editCollectionItem][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to edit this collection"})
      }
      if (allowed == 500) {
        logger.debug("[editCollectionItem][Status 500]")
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        _loadModel.buildCollectionModel(req, res, function (next) {
          app.next_module.findById(req.params.item_id, function (err, item) {
            if (err) return res.sendStatus(500);
            if (!item) return res.sendStatus(404);
            else {
              item.updateAttributes(req.body, function (err) {
                if (err) return res.status(500).send({error: err})
                else return res.status(200).send({message: "item updated"});
              })
            }
          })
        })
      }
    })
  })

  Repository.beforeRemote('deleteCollectionItem', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        logger.debug("[deleteCollectionItem][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to delete this collection"})
      }
      if (allowed == 500) {
        logger.debug("[deleteCollectionItem][Status 500]")
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        _loadModel.buildCollectionModel(req, res, function (next) {
          app.next_module.findById(req.params.item_id, function (err, item) {
            if (err) return res.sendStatus(500);
            if (!item) return res.sendStatus(404);
            else {
              app.models.Replica.find({where: {itemId: req.params.item_id}}, function (err, entry) {
                if (err) return res.status(500).send({error: err})
                if (entry && entry.length > 0) {
                  logger.debug("[Repository.beforeRemote('deleteCollectionItem][The item still has replicas]", entry)
                  return res.status(403).send({message: "The item still has replicas", replicas: entry})
                }
                else {
                  item.destroy(req.body, function (err) {
                    if (err) return res.status(500).send({error: err})
                    else {
                      req.params.repo_name = req.params.collection_name;
                      _loadModel.removeModel(req, res, function (cb) {
                        return res.status(200).send({message: "The item [" + item.id + "] has been removed"})
                      })
                    }
                  })
                }
              })
            }
          })
        })
      }
    })
  })


  Repository.beforeRemote('populateCollection', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        logger.debug("[populateCollection][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to access this collection"})
      }
      if (allowed == 500) {
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        _loadModel.buildCollectionModel(req, res, function (next) {
          console.log("QUI QUI");
          _loadModel.createPersistedModel(req, res, function (next) {
            app.persistedModel.create(req.body, function (err, instance) {
              if (err) {
                return res.status(500).send(err);
              }
              else
                res.status(201).send(instance)
            })
          })
        })
      }
    })
  })

  Repository.beforeRemote('createRelation', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    _loadModel.buildRepositoryModel(req, res, function (next) {
      if (next) {
        _loadModel.validateRelationBody(req, res, function (next) {
          if (next) {
            final()
          } else return res.sendStatus(412)
        })
      }
    })
  })
  Repository.beforeRemote('getRelation', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    _loadModel.buildCollectionModel(req, res, function (next) {
      app.first_model = app.next_module;
      _modelRelation.buildRelation(req, res, function (relation) {
        return final()
      })
    })
  })
  Repository.beforeRemote('getReplicas', function (context, user, final) {
    var req = context.req;
    var res = context.res;
    _loadModel.buildCollectionModel(req, res, function (next) {
      return final()
    })
  })
  Repository.beforeRemote('getReplicaById', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    _loadModel.buildCollectionModel(req, res, function (next) {
      logger.debug("app.next_module:", app.next_module.definition.name);
      return final()
    })
  })

  Repository.afterRemote('find', function (context, user, final) {

    var ctx = loopback.getCurrentContext();
    var accessToken = ctx.get('accessToken');
    for (var i = 0; i < context.result.length; i++) {
      if (context.result[i].collection_db) {
        context.result[i].collection_db.password = "********"
      }
      var path = context.result[i].path
      context.result[i].path = api_prefix + path;
      context.result[i] = {
        name : context.result[i].name,
        path : context.result[i].path,
        collection_db : context.result[i].collection_db,
        default_storage : context.result[i].default_storage

      }
    }
    return final()

  })


  /* ------------------------------------------------------ remoteMethod ---------------------------------------------*/

  Repository.remoteMethod('getRepository', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    http: {path: '/:repo_name/', verb: 'get'},
    returns: {arg: 'data', type: 'object', root: true}
  });

  Repository.remoteMethod('editRepository', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    http: {path: '/:repo_name/', verb: 'put'},

    returns: {arg: 'data', type: 'object'}
  });

  Repository.remoteMethod('deleteRepository', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    http: {path: '/:repo_name/', verb: 'delete'},

    returns: {arg: 'data', type: 'object'}
  })


  /* -------------- Collections ----------------------------------------*/

  Repository.remoteMethod('getCollectionCount', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'instance', type: 'object'},
    http: {path: '/:repo_name/:collection_name/_count', verb: 'get'}
  });
  
  
  
  Repository.remoteMethod('getCollection', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'instance', type: 'array'},
    http: {path: '/:repo_name/:collection_name', verb: 'get'}
  });

  Repository.remoteMethod('editCollectionBody', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'instance', type: 'array'},
    http: {path: '/:repo_name/:collection_name', verb: 'put'}
  });

  Repository.remoteMethod('deleteCollection', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'instance', type: 'array'},
    http: {path: '/:repo_name/:collection_name', verb: 'delete'}
  })

  Repository.remoteMethod('getCollectionSchema', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'instance', type: 'array'},
    http: {path: '/:repo_name/:collection_name/_schema', verb: 'get'}
  });

  Repository.remoteMethod('createCollection', {
    http: {path: '/:repo_name/', verb: 'post'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  });

  Repository.remoteMethod('populateCollection', {
    http: {path: '/:repo_name/:collection_name/', verb: 'post'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  });

  Repository.remoteMethod('getCollectionItem', {
    http: {path: '/:repo_name/:collection_name/:item_id', verb: 'get'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  });

  Repository.remoteMethod('editCollectionItem', {
    http: {path: '/:repo_name/:collection_name/:item_id', verb: 'put'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  });

  Repository.remoteMethod('deleteCollectionItem', {
    http: {path: '/:repo_name/:collection_name/:item_id', verb: 'delete'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  });

  /* -------------- Relations ----------------------------------------*/

  Repository.remoteMethod('createRelation', {
    http: {path: '/:repo_name/:collection_name/_relations', verb: 'post'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })

  Repository.remoteMethod('getRelation', {
    http: {path: '/:repo_name/:collection_name/:item_id/:related_coll_name', verb: 'get'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })
  /* -------------- Replica ----------------------------------------*/


  Repository.remoteMethod('createReplica', {
    http: {path: '/:repo_name/:collection_name/:item_id/_replicas', verb: 'post'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })

  Repository.remoteMethod('getReplicas', {
    http: {path: '/:repo_name/:collection_name/:item_id/_replicas', verb: 'get'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })

  Repository.remoteMethod('getReplicaById', {
    http: {path: '/:repo_name/:collection_name/:item_id/_replicas/:replica_id', verb: 'get'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })

  Repository.remoteMethod('deleteReplicaById', {
    http: {path: '/:repo_name/:collection_name/:item_id/_replicas/:replica_id', verb: 'delete'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })


  Repository.remoteMethod('uploadReplicaById', {
    http: {path: '/:repo_name/:collection_name/:item_id/_replicas/:replica_id', verb: 'put'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })

  /* -------------- ACL ----------------------------------------*/


  Repository.remoteMethod('SetACLtoRepository', {
    http: {path: '/:repo_name/_acls', verb: 'post'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })

  Repository.remoteMethod('getACLsByusername', {
    http: {path: '/:repo_name/_acls/:acls_for_user', verb: 'get'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })

  Repository.remoteMethod('getACLsByusername', {
    http: {path: '/:repo_name/:collection_name/_acls/:acls_for_user', verb: 'get'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })

  Repository.remoteMethod('ListACLforRepositories', {
    http: {path: '/:repo_name/_acls', verb: 'get'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })

  Repository.remoteMethod('ListACLforCollections', {
    http: {path: '/:repo_name/:collection_name/_acls', verb: 'get'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })

  Repository.remoteMethod('SetACLtoCollection', {
    http: {path: '/:repo_name/:collection_name/_acls', verb: 'post'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })

  Repository.remoteMethod('SetACLtoCollection', {
    http: {path: '/:repo_name/:collection_name/_acls', verb: 'put'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })


  /*-------------------------------------OBSERVE---------------------------------------------------*/

  Repository.observe('before save', function (context, final) {
    if (context.currentInstance) return final()
    logger.debug('[Repository][before save]', context.instance);
    var req = {body: context.instance};
    var res = context.result;

    _loadModel.buildpayload(req, res, function (next) {
      if (!next) {
        error = sendError(400, 'Invalid request');
        return final(error);
      }

      logger.debug("[Repository][before save][payload]", app.bodyReadToWrite);
      var payload = app.bodyReadToWrite;
      Repository.findOne({where: {"name": req.body.name}}, function (err, value) {
        if (err) {
          error = sendError(500, err);
          return final(error);
        }
        if (value) {
          msg = "A repository named " + context.instance.name + " is already defined";
          error = sendError(409, msg)
          return final(error);
        } else {
          context.instance.path = payload.path;
          context.instance.tablename = payload.tablename;
          context.instance.collection_db = payload.collection_db ? payload.collection_db : null
          context.instance.default_storage = payload.default_storage ? payload.default_storage : null
          logger.debug("[[Repository][before save]][context.instance edited]:", context.instance);
          return final()
        }
      })
    })
  })

  Repository.observe('after save', function (context, final) {
    logger.debug('[Repository][after save]');
    if (context.isNewInstance == false) return final()
    var repositoryDB = app.dataSources.repoDB;

    service.createTable(repositoryDB, app.bodyReadToWrite, function (callback) {
      if (callback) {

        var code = 201;
        var message = "The repository was successfully created";
        var response = {msg: {status: code, message: message}}
        context.result = {
          data: "OK"
        };
        logger.debug(context.result);
        return final();

      } else {
        error = sendError(500, 'Error during service CreateTable')
      }
    })

  })
}
