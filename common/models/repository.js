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

  /* ----------------------- https and openstack testing remote methods-----------------------------
   Repository.beforeRemote('list_repositories', function (context, user, next) {
   var req = context.req;
   req.body.publisherId = req.accessToken.userId;
   userId = req.accessToken.userId;
   next();
   })


   Repository.remoteMethod('openstack_login', {
   returns: {arg: 'client', type: 'object'},
   http: {path: '/openstackLogin', verb: 'get'}
   })

   Repository.remoteMethod('testhttps', {
   returns: {arg: 'client', type: 'object'},
   http: {path: '/testRequest', verb: 'get'}
   })

   Repository.remoteMethod('login_repository', {
   accepts: {arg: 'req', type: 'object', http: {source: 'body'}},
   returns: {arg: 'repositories', type: 'array'},
   http: {path: '/login_repository', verb: 'post'}
   });


   Repository.remoteMethod('list_repositories', {
   returns: {arg: 'repositories', type: 'array'},
   http: {path: '/list_repositories', verb: 'get'}
   });


   Repository.list_repositories = function (next) {
   Repository.find({
   where: {
   ownerId: userId
   }
   }, next);
   };

   Repository.openstack_login = function (req, next) {

   var client = require('pkgcloud').storage.createClient({
   provider: 'openstack',
   username: 'acaland',
   password: 'demo2015',
   tenantName: 'glibrary',
   authUrl: 'https://stack-server-01.ct.infn.it:35357/',
   options: {
   ca: fs.readFileSync(path.join(__dirname, '../../server/private/INFNCA.pem')).toString()


   }
   });


   client.getContainers(function (err, containers) {
   if (err) throw err;
   console.log("****CONTAINERS****:");
   containers.forEach(function (value) {
   console.log("VALUE:", value.name);
   })
   })

   client.getFiles('demo', function (err, files) {
   if (err) throw err;
   // console.log("FILES:",files);
   })
   client.getFile('demo', 'ananas33.jpg', function (err, server) {
   // console.log("GETFILE:",server);
   })
   client.download({
   container: 'demo',
   remote: 'ananas33.jpg'
   }).pipe(fs.createWriteStream('download_ananas33.jpg'));


   }
   Repository.testhttps = function (req, next) {


   var testData = {
   "uri": "https://stack-server-01.ct.infn.it:35357/v2.0/tokens",
   "method": "POST",
   "headers": {
   "User-Agent": "nodejs-pkgcloud/1.2.0-alpha.0",
   "Content-Type": "application/json", "Accept": "application/json"
   },
   "json": {
   "auth": {
   "passwordCredentials": {"username": "acaland", "password": "demo2015"},
   "tenantName": "glibrary"
   }
   },
   "ca": "-----BEGIN CERTIFICATE-----\nMIIDczCCAlugAwIBAgIBADANBgkqhkiG9w0BAQUFADAuMQswCQYDVQQGEwJJVDEN\nMAsGA1UEChMESU5GTjEQMA4GA1UEAxMHSU5GTiBDQTAeFw0wNjEwMDMxNDE2NDda\nFw0xNjEwMDMxNDE2NDdaMC4xCzAJBgNVBAYTAklUMQ0wCwYDVQQKEwRJTkZOMRAw\nDgYDVQQDEwdJTkZOIENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\nzpWODoOVnUKpyikjyrdj+QpJuoJeKkqF4fbd6LrqeQL0dqAiluVR8D4y/T2Mqvsd\nH/fg0s3EYZUDQZimcAmC3ammTX3rqXOz34GWLGpXoXAmUVKWPNFJo6rAEwhw3Sja\na8mEjMiZE/JigHN5RI8K6taKtjL/jE4XUTZOGbvlKsROxzJPM6bO4GJdYO+qhK9E\n5HsbV699DYyukBfUB6ChtD6GDbcdPKUKwheni5j0v6smFjiBEb3VQg4O+uBWTHMP\n116L9kPY+I7ojzXLuayMTd+6TXzunR33+v6h8AtLChcQRt4vj7oG/scTg3eSnFsq\noEO4D4IF9v481GJJwg58LwIDAQABo4GbMIGYMA8GA1UdEwEB/wQFMAMBAf8wDgYD\nVR0PAQH/BAQDAgEGMB0GA1UdDgQWBBTRYvOzd3LILvvyeRpvN04nnxPVIDBWBgNV\nHSMETzBNgBTRYvOzd3LILvvyeRpvN04nnxPVIKEypDAwLjELMAkGA1UEBhMCSVQx\nDTALBgNVBAoTBElORk4xEDAOBgNVBAMTB0lORk4gQ0GCAQAwDQYJKoZIhvcNAQEF\nBQADggEBAHjX0z+3P3JyQGIBI5aAXOS3NuDEf0MdqCLFIGsXjtvIm2kDSMSGQOg5\nuZnJLTAhaT+gX5eNkDdzhuuJEgW1FPGDy2If6zgD4T4EsS50E+L5BTNOG78UzF4H\n9DGBlbrkD8VEug9RpxGusSweGGlnO6CT/U1Tb3XY5ZjIrMubh09UwmjK9nEIe3vC\nRPInAkbmamteezpKOqC5Knj0ZpqU+CnWkuyYnjslX1e9O5lbupLTp5NOqZRCFn1i\niTjpoNefgqLE3sHedgb2P1vS8lO+EIhRnWgfN9qAHSqkQ+ZObxIfPJFdcluu8d/K\ntXsFkKmmFuEHd0SrYpBh9ZCLDgq2x9Y=\n-----END CERTIFICATE-----\n"
   };
   var cert = fs.readFileSync(path.join(__dirname, '../../server/private/INFNCA.pem')).toString();

   var requestData = {
   auth: {
   'tenantName': 'glibrary',
   'passwordCredentials': {
   'username': 'acaland',
   'password': 'demo2015'
   }
   }
   }

   request(testData, function (err, response, body) {
   if (err) throw err;
   console.log("RES", response.statusCode);
   console.log("BODY", body);
   })
   /*

   request({
   url: 'https://stack-server-01.ct.infn.it:35357/v2.0/tokens',
   method: "POST",
   headers: {
   "content-type": "application/json",
   },

   ca: cert,
   body: JSON.stringify(requestData)
   },function(err,res,body) {
   if(err) throw err;
   console.log("RES:",res.statusCode);
   console.log("BODY",body);

   });

   }
   */


  /* --- Repository -----*/
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.getRepository = function (req, res, next) {
    _loadModel.getRepository(req, res, function (model) {
      if (model) {
        console.log("[Repository.getRepository]", app.repositoryModel.definition.name)
        var fields = {
          fields: {name: true, location: true, path: true}
        }
        var query_filters = JSON.parse((JSON.stringify(fields) + JSON.stringify(req.query.filter)).replace(/}{/g, ","));
        app.repositoryModel.find(query_filters, function (err, instance) {
          if (err) {
            return res.status(500).send({error: err})
          }
          if (!instance) {
            return res.status(404).send({error: "Repository not Found"})
          }
          if (instance) {
            return res.status(200).send(instance);
          }
        })
      } else return res.status(500).send({error: "getRepository error"})
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


  Repository.deleteRepository = function (req, res, next) {

    console.log("[deleteRepository]: ", req.params.repo_name)
    app.models.Repository.findOne({where: {name: req.params.repo_name}}, function (err, repo) {
      if (err) return res.status(500).send({error: err});
      if (!repo) return res.status(404).send({"message": "Repository not found"});
      app.models.Repository.destroyById(repo.id, function (err) {
        if (err) return res.status(500).send({error: err});
        _loadModel.removeModel(req, res, function (cb) {
          return res.status(200).send({message: "The repository [" + req.params.repo_name + "] has been removed"})
        })
      })
    })
  }

  /* ---- GET Collection ----*/
  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.getCollection = function (req, res, next) {

    console.log("[Repository.getCollection]", req.query.filter)
    _loadModel.getCollection(req, res, function (next) {
      if (!next) return res.status(500).send({message: "getCollection Error"})
      app.next_module.find(req.query.filter, function (err, instance) {
        if (err) return res.status(500).send({"error": err});
        if (!instance) return res.status(404).send({"message": "Collection not found"});
        return res.json(instance);
      })
    })
  }


  Repository.editCollectionBody = function (req, res, next) {

    console.log("[Repository.editCollectionBody]", req.query.filter)
    _loadModel.getCollection(req, res, function (next) {
      if (!next) return res.status(500).send({message: "getCollection Error"})
      app.next_module.findById(req.body.id, function (err, instance) {
        if (err) return res.status(500).send({"error": err});
        if (!instance) return res.status(404).send({"message": "Collection not found"});
        console.log("INSTANCE", instance)
        instance.updateAttributes(req.body, function (err) {
          return res.status(200).send({message: "Collection updated"})
        })
      })
    })
  }
  Repository.deleteCollection = function (req, res, next) {

    console.log("[Repository.deleteCollection]", req.params.collection_name)
    _loadModel.getRepository(req, res, function (next) {
      if (!next) return res.status(500).send({message: "getCollection Error"})
      app.repositoryModel.findOne({where: {name: req.params.collection_name}},
        function (err, instance) {
          if (err) return res.status(500).send({error: err});
          if (!instance) return res.status(404).send({message: "Collection not found"});
          console.log("instance", instance);
          instance.destroy(function (err) {
            if (err) return res.status(500).send({error: "Instance destroy error"})
            else {
              req.params.pathToDelete = req.params.collection_name;
              _loadModel.removeModel(req, res, function (cb) {
                return res.status(200).send({message: "The collection [" + req.params.collection_name + "] has been removed"})
              })
            }
          })
        })
    })
  }


  Repository.getCollectionSchema = function (req, res, next) {
    console.log("[Repository.getCollectionSchema]");
    return res.json(app.next_module.definition.properties);
  }

  Repository.createCollection = function (req, res, next) {
    return res.status(201).send({message: "The collection was successfully created "})
  }

  Repository.populateCollection = function (req, res, next) {
    //return res.status(200).send;
  }

  Repository.getCollectionItem = function (req, res, next) {
  }

  Repository.editCollectionItem = function (req, res, next) {
  }


  /*------------------------ Model Relations -----------------------------*/

  Repository.createRelation = function (req, res, next) {

    app.repositoryModel.findOne({where: {name: req.params.collection_name}},
      function (err, instance) {

        if (err) res.sendStatus(500);
        if (!instance) return res.status(404).send({"error": "Collection not found"});
        var relation_array = (!instance.relatedTo ? [] : instance.relatedTo)
        console.log("[Repository.createRelation]", relation_array);
        _loadModel.checkduplicate(relation_array, app.relationbody, function (duplicate) {
          if (duplicate) return res.status(409).send({"error": "Relation " + app.relationbody.relatedCollection + " is already defined"})
          else {
            relation_array.push(app.relationbody)
            var relatedTo = {"relatedTo": relation_array}
            instance.updateAttributes(relatedTo, function (err) {
              if (err) return res.status(500).send({"error": "Error during updating attributes"})
              else {
                logger.debug("[rest-api][updateAttribute on = ", instance.path + "of Repository Model " + app.repositoryModel.definition.name);
                return res.status(201).send({"message": "Relation Created"})
              }
            })
          }
        })
      })
  }
  Repository.getRelation = function (req, res, next) {

    //  logger.info("----------[Repository.getRelation][app.relationName = ", app.relationName + "]");
    console.log(" GET RELATION  app.first_model", app.first_model.definition.name)
    app.first_model.findById(req.params.item_id,
      {include: app.relationName},
      function (err, instance) {
        if (err) {
          logger.error("Relation Query Error:", err);
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
      console.log("payload:", payload);
      console.log("repositoryDB", repositoryDB.settings.host +
        " DB =", repositoryDB.settings.database)
      Replica.create(payload, function (err, instance) {
        if (err) return res.status(500).send({message: err});
        console.log("instance", instance);
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

  /*
   Repository.deleteReplicaById = function(req,res,next) {

   var Replica = app.models.Replica;
   console.log("[deleteReplicaById",req.params.replica_id);
   Replica.destroyById(req.params.replica_id,function(err,replica){
   if(err) return res.status(500).send({error:err})
   console.log("Count:",replica.count)
   if(replica.count > 0) return res.status(200).send({message:"The Replica id < "+req.params.replica_id+" > has been removed"})
   else return res.status(404).send({message:"Replica not found"})
   })
   }
   */
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
        console.log("URI:", uri);
        var url = getTempURL(uri, 'GET');
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
        console.log("URI:", uri);
        var url = getTempURL(uri, 'PUT');
        if (!url.error) {
          return res.status(200).send({uploadURI: url.url})
        } else return res.status(404).send({message: 'Account or Object not found'});
      })
  }


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
        console.log("URI:", uri);
        var url = getTempURL(uri, 'DELETE');
        console.log("DELETE-URL:", url.error)
        if (url.error == 0) {
          console.log("[deleteReplicaById", req.params.replica_id);

          request.del(url.url, function (err, response, body) {

              if (!err && response.statusCode == '204' || req.body.force) {
                Replica.destroyById(req.params.replica_id, function (err, replica) {
                  if (err) return res.status(500).send({error: err})
                  console.log("Count:", replica.count)
                  if (replica.count > 0)
                    return res.status(200).send({message: "Replica [ "+req.params.replica_id+ " ] has been removed"})
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

    var keys = {
      "AUTH_51b2f4e508144fa5b0c28f02b1618bfd": "correcthorsebatterystaple",
      "AUTH_3729798f1d494dcba22abe9763c22258": "4paxXm3tar94T62oGrlQSi5bE4o5mcA1",
      "glibrary": ""
    };
    var expirationTimeInSeconds = 60;
    var storage_parts = url.parse(uri);
    var host = storage_parts.host;
    var path = storage_parts.pathname;
    console.log("[getTempURL]", host);
    console.log("[getTempURL]", path);
    //console.log(req.params);
    //console.log(req.method);
    //console.log(req.route);

    var expires = Math.floor(Date.now() / 1000) + expirationTimeInSeconds;
    if (path[0] != '/') {
      path = '/' + path;
    }
    var pathParts = path.split('/', 5);
    //console.log(pathParts);
    if (pathParts.length != 5 || pathParts[0] || pathParts[1] != 'v1' || !pathParts[2] || !pathParts[3] || pathParts[4] == '/') {
      res.json(400, {
        error: "WARNING: " + path + " does not refer to a Swift Object (e.g. /v1/account/container/object)"
      });
    }
    var account = pathParts[2];
    if (keys[account]) {
      var body = method + '\n' + expires + '\n' + path;
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


  /*----------------- ACL ----------------------------------------*/

  /**
   *
   * @param body
   * @param next
   * @returns {*}
   */
  var validateGrantAccessBody = function (body, next) {
    console.log("body", body);
    if (!body.grant || !body.user) {
      return next({
        "validate": false
      })
    }
    app.models.User.findOne({where: {"email": body.user}}, function (err, user) {
      console.log("User", user);
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


  var removePermissionsToUser = function (payload, label, next) {
    var RoleMapping = app.models.RoleMapping;

    var permission = payload.grant
    payload.kind = label
    console.log("GRANT:", app.PropertiesMap[label + permission].property)

    /*
     _modelACL.removePrincipalIdFromRole(payload,function(callback){
     console.log("[removePermissionToUser]",callback)
     })
     */
  }

  /**
   *
   * @param source
   * @param label
   * @param next
   */

  var grantPermissionsToUser = function (source, label, next) {
    var RoleMapping = app.models.RoleMapping;

    console.log("SOURCE:", source)
    console.log("LABEL:", label)
    var permission = source.grant
    //console.log("REPO_GRANT", app.PropertiesMap)
    console.log("PERMISSION", permission)
    if (source.grant.length > 1) {
      console.log("[grantPermissionToUser][source.grant.length > 1]")
      async.parallel([
        function (callback) {

          _modelACL.addPrincipalIdToRole(app.PropertiesMap[label + permission.split('-')[0]].property,
            RoleMapping.USER, source.userId, source.access, function (cb) {
              console.log("[1]Callback from grantPermissionsToUser", cb);
              callback(null, cb)
            })
        },
        function (callback) {
          _modelACL.addPrincipalIdToRole(app.PropertiesMap[label + permission.split('-')[1]].property,
            RoleMapping.USER, source.userId, source.access, function (cb2) {
              console.log("[2]Callback from grantPermissionsToUser", cb2);
              callback(null, cb2)
            })
        }
      ], function (err, cb) {
        console.log("-----------FINE-------------", cb)
        if (!err && cb[0] != false || cb[1] != false) return next(true)
        else return next(false);

      });
    }
    else {
      console.log("[grantPermissionToUser][source.grant.length == 1]", source)
      _modelACL.addPrincipalIdToRole(app.PropertiesMap[label + permission].property,
        RoleMapping.USER, source.userId, source.access, function (callback) {
          console.log("[3]Callback from grantPermissionsToUser", callback);
          return next(callback)
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
    console.log("[SetACLtoRepository]", req.body);
    validateGrantAccessBody(req.body, function (isvalidate) {
      if (!isvalidate.validate) return res.status(400).send({message: 'Bad payload'})
      {
        var payload = {
          "userId": isvalidate.userId,
          "grant": req.body.grant,
          "access": {
            "repositoryName": req.params.repo_name
          }
        }
        grantPermissionsToUser(payload, 'Repo', function (permission) {
          if (permission) {
            console.log("PERMISSION:", permission);
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
    console.log("grantAccess", req.body);
    validateGrantAccessBody(req.body, function (isvalidate) {
      if (!isvalidate.validate) return res.status(400).send({message: 'Bad payload'})
      console.log("Validate:", isvalidate);
      var payload = {
        "userId": isvalidate.userId,
        "grant": req.body.grant,
        "access": {
          "repositoryName": req.params.repo_name,
          "collectionName": req.params.collection_name
        }
      }
      console.log("payload", payload);
      grantPermissionsToUser(payload, 'Coll', function (permission) {
        if (permission) {
          if (req.body.item_grant) {
            console.log("ITEM_GRANT", req.body.item_grant);
            var payload = {
              "userId": isvalidate.userId,
              "grant": req.body.item_grant,
              "access": {
                "repositoryName": req.params.repo_name,
                "collectionName": req.params.collection_name
              }
            }
            grantPermissionsToUser(payload, 'Item', function (permission) {
              if (permission) {
                return res.status(200).send({message: "ACL has been added"});
              } else {
                return res.status(409).send({message: "ACL is already exists"});
              }
            })
          } else {
            return res.status(200).send({message: "ACL has been added"});
          }
        }
        else {
          return res.status(409).send({message: "ACL is already exists"});
        }
      })
    })
  }
  Repository.RemoveACLtoCollection = function (req, res, next) {

    console.log("RemoveACLtoCollection", req.body)
    console.log("RemoveACLtoCollection", req.params.repo_name)
    console.log("RemoveACLtoCollection", req.params.collection_name)

    validateGrantAccessBody(req.body, function (isvalidate) {
      if (!isvalidate.validate) return res.status(400).send({message: 'Bad payload'})
      console.log("Validate:", isvalidate);
      var payload = {
        "userId": isvalidate.userId,
        "grant": req.body.grant,
        "access": {
          "repositoryName": req.params.repo_name,
          "collectionName": req.params.collection_name
        }
      }
      console.log("payload", payload);
      removePermissionsToUser(payload, 'Coll', function (permission) {
        console.log("Removed Permission:", permission)
      })
    })


  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  Repository.getACLforRepository = function (req, res, next) {
    app.models.User.find({where: {"email": req.params.acls_for_user}}, function (err, access) {
      //app.models.access.find({where: {"repositoryName": req.params.repo_name}},{include:'users'}, function (err, access) {
      if (err) {
        return res.setatus(500).send({error: err})
      }
      if (access.length == 0) {
        return res.setatus(404).send({message: "USER NOT FOUND"})
      }
      app.models.RoleMapping.find({where: {"principalId": access[0].id}}, function (err, mapping) {
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


  /*--------- beforeRemote Hooks ------*/

  Repository.beforeRemote('getRepository', function (context, user, final) {

    var res = context.res;
    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        console.log("[getRepository][Status 401 Unauthorized]")
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

  Repository.beforeRemote('editRepository', function (context, user, final) {

    var res = context.res;
    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        console.log("[editRepository][Status 401 Unauthorized]")
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

  Repository.beforeRemote('deleteRepository', function (context, user, final) {

    var res = context.res;
    var req = context.req;

    console.log("deleteRepository")

    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        console.log("[deleteRepository][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to delete this repository"})
      }
      if (allowed == 500) {
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        _loadModel.getRepository(req, res, function (next) {
          if (next) {
            console.log("req.params.repo_name",req.params.repo_name)
            app.repositoryModel.findOne(function (err, value) {
              console.log("VALUE:",value)
              if(value) {
                return res.status(403).send({message:"The repository still has collections"})
              }
              else return final()
            })
          } else res.status(500).send({error:"getRepository error"})
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
        console.log("[createCollection][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to access this collection"})
      }
      if (allowed == 500) {
        console.log("[createCollection][Status 500]")
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        // validate Body
        _loadModel.validatebody(req, res, function (cb) {
          if (cb) {
            // getRepository Model
            _loadModel.getRepository(req, res, function (next) {
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
        console.log("[getCollection][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to access this collection"})
      }
      if (allowed == 500) {
        console.log("[getCollection][Status 500]")
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
      console.log("[getCollection][Status 401 Unauthorized]")
      return res.status(400).send({"error": "id empty or not found"})

    }
    _modelACL.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        console.log("[getCollection][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to edit this collection"})
      }
      if (allowed == 500) {
        console.log("[getCollection][Status 500]")
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
        console.log("[getCollection][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to remove this collection"})
      }
      if (allowed == 500) {
        console.log("[getCollection][Status 500]")
        res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {

        _loadModel.getCollection(req, res, function (next) {
          app.next_module.findOne(function (err, item) {
            if (err) return res.sendStatus(500);
            if (!item) return final();
            else {
              console.log("COLLECTION ITEMS", item)
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
        console.log("[getCollection][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to access this collection"})
      }
      if (allowed == 500) {
        console.log("[getCollection][Status 500]")
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        _loadModel.getCollection(req, res, function (next) {
          app.next_module.findById(req.params.item_id, function (err, item) {
            if (err) return res.sendStatus(500);
            if (!item) return res.sendStatus(404);
            else {
              console.log("ITEM", item)
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
        console.log("[getCollection][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to edit this collection"})
      }
      if (allowed == 500) {
        console.log("[getCollection][Status 500]")
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        _loadModel.getCollection(req, res, function (next) {
          app.next_module.findById(req.params.item_id, function (err, item) {
            if (err) return res.sendStatus(500);
            if (!item) return res.sendStatus(404);
            else {
              console.log("ITEM", item)
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
        console.log("[getCollection][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to delete this collection"})
      }
      if (allowed == 500) {
        console.log("[getCollection][Status 500]")
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        _loadModel.getCollection(req, res, function (next) {
          app.next_module.findById(req.params.item_id, function (err, item) {
            if (err) return res.sendStatus(500);
            if (!item) return res.sendStatus(404);
            else {
              console.log("ITEM", item)
              app.models.Replica.find({where: {itemId: req.params.item_id}}, function (err, entry) {
                if (err) return res.status(500).send({error: err})
                if (entry && entry.length > 0) {
                  console.log("REPLICHE PRESENTI", entry)
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
        console.log("[populateCollection][Status 401 Unauthorized]")
        return res.status(401).send({"error": "You are not allowed to access this collection"})
      }
      if (allowed == 500) {
        return res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        _loadModel.getCollection(req, res, function (next) {
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
    _loadModel.getRepository(req, res, function (next) {
      if (next) {
        _loadModel.validateRelationBody(req, res, function (next) {
          if (next) {
            console.log("OK VALIDATE")
            final()
          } else return res.sendStatus(412)
        })
      }
    })
  })
  Repository.beforeRemote('getRelation', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    _loadModel.getCollection(req, res, function (next) {
      app.first_model = app.next_module;
      _modelRelation.buildRelation(req, res, function (relation) {
        return final()
      })
    })
  })
  Repository.beforeRemote('getReplicas', function (context, user, final) {
    var req = context.req;
    var res = context.res;
    _loadModel.getCollection(req, res, function (next) {
      return final()
    })
  })
  Repository.beforeRemote('getReplicaById', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    _loadModel.getCollection(req, res, function (next) {
      console.log("app.next_module:", app.next_module.definition.name);
      return final()
    })
  })

  Repository.afterRemote('find', function (context, user, final) {

    for (var i = 0; i < context.result.length; i++) {
      if (context.result[i].coll_db) {
        context.result[i].coll_db.password = "********"
      }
    }
    return final()

  })

  /* ---------------------- remoteMethod ------------------------*/

  Repository.remoteMethod('getRepository', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    http: {path: '/:repo_name/', verb: 'get'},

    returns: {arg: 'data', type: 'object'}
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
    http: {path: '/:repo_name/:collection_name/_relation', verb: 'post'},
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

  Repository.remoteMethod('getACLforRepository', {
    http: {path: '/:repo_name/_acls/:acls_for_user', verb: 'get'},
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

  Repository.remoteMethod('RemoveACLtoCollection', {
    http: {path: '/:repo_name/:collection_name/_acls', verb: 'delete'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })


  /*-------------------------------------OBSERVE---------------------------------------------------*/


  Repository.observe('before save', function (context, final) {
    if (context.currentInstance) return final()
    console.log('Going to create Repository');
    console.log("Body:", context.instance);
    var req = {body: context.instance};
    var res = context.result; // undefined

    _loadModel.buildpayload(req, res, function (next) {
      if (!next) {
        error = sendError(400, 'Invalid request');
        return final(error);
      }

      console.log("payload", app.bodyReadToWrite);
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
          context.instance.location = payload.location;
          context.instance.coll_db = payload.coll_db;
          console.log("*-Body-*:", context.instance);
          return final()
        }
      })
    })
  })


  Repository.observe('after save', function (context, final) {
    console.log('Going to POST SAVE Repository');
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
        console.log(context.result);
        return final();

      } else {
        error = sendError(500, 'Error during service CreateTable')
      }
    })

  })
}
