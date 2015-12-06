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
  var testLib = require('../helpers/loadModel');
  var relation = require("../helpers/modelRelation");
  var roleLib = require("../helpers/modelACL")
  var rl = new relation(app);
  var tl = new testLib(app);
  var rm = new roleLib(app);
  var isStatic = true;
  var loopback = require('loopback');
  var async = require('async');


  /*
   Disable GET /api/repositories/myrepo/1 in order to allow
   GET /api/repositories/myrepo/collection
   */
  Repository.disableRemoteMethod('findById', isStatic);

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
  /*
   Repository.createRepository = function (req, res, next) {
   console.log("[Repository.createRepository]");

   }
   */
  Repository.getRepository = function (req, res, next) {
    tl.getRepository(req, res, function (next) {
      if (next) {
        console.log("[Repository.getRepository]", app.repositoryModel.definition.name)
        var fields = {
          fields: {name: true, location: true, path: true}
        }
        var query_filters = JSON.parse((JSON.stringify(fields) + JSON.stringify(req.query.filter)).replace(/}{/g, ","));
        app.repositoryModel.find(query_filters, function (err, instance) {
          if (err) {
            res.sendStatus(500)
          }
          if (!instance) {
            res.status(404).send({error: "Repository not Found"})
          }
          if (instance) {
            res.send(instance);
          }
        })


      } else res.sendStatus(500)
    })
  }

  /* ---- GET Collection ----*/

  Repository.getCollection = function (req, res, next) {

    console.log("[Repository.getCollection]", req.query.filter)
    tl.getCollection(req, res, function (next) {
      app.next_module.find(req.query.filter, function (err, instance) {
        if (err) return res.status(500).send({"error": err});
        if (!instance) return res.sendStatus(404);
        return res.json(instance);
      })
    })
  }

  Repository.getCollectionSchema = function (req, res, next) {
    console.log("[Repository.getCollectionSchema]");
    res.json(app.next_module.definition.properties);
  }

  Repository.createCollection = function (req, res, next) {
    res.status(201).send({message: "The collection was successfully created "})

  }

  Repository.populateCollection = function (req, res, next) {
    res.sendStatus(200, 'Items created');
  }

  Repository.getCollectionItem = function (req, res, next) {
  }


  /*----- Model Relations -----*/

  Repository.createRelation = function (req, res, next) {

    app.repositoryModel.findOne({where: {name: req.params.collection_name}},
      function (err, instance) {

        if (err) res.sendStatus(500);
        if (!instance) return res.status(404).send({"error": "Collection not found"});
        var relation_array = (!instance.relatedTo ? [] : instance.relatedTo)
        console.log("[Repository.createRelation]", relation_array);

        tl.checkduplicate(relation_array, app.relationbody, function (duplicate) {
          if (duplicate) return res.status(409).send({"error": "Relation " + app.relationbody.relatedCollection + " is already defined"})
          else {
            relation_array.push(app.relationbody)
            var relatedTo = {"relatedTo": relation_array}
            instance.updateAttributes(relatedTo, function (err) {
              if (err) res.status(500).send({"error": "Error during updating attributes"})
              else {
                logger.debug("[rest-api][updateAttribute on = ", instance.path + "of Repository Model " + app.repositoryModel.definition.name);
                res.status(201).send({"message": "Relation Created"})
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
        res.json(instance);
      })
  }
  /*------------ Replicas---------------*/

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
      var uri = (repodata.default_storage.baseURL ? repodata.default_storage.baseURL+'/'+req.body.filename : req.body.uri)
      var type = (repodata.default_storage.type ? repodata.default_storage.type : req.body.type)

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
        return res.sendStatus(200);
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
      if (!replicas) return res.sendStatus(404);
      return res.json(replicas);
    })
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

    console.log("HOST", host);
    console.log(path);
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
        if (!replica) return res.sendStatus(404);

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

  var validateGrantAccessBody = function (body, next) {
    console.log("body", body);
    app.models.User.findOne({where:{"email":body.user}},function(err,user){
      console.log("User",user);
      if(err) {
        return next({
          "validate":false
        })
      }
      if(user) {
        return next({
          "validate":true,
          userId: user.id
        })
      } else {
        return next({
          "validate":false
        })
      }
    })
  }

  var grantPermissionsToUser = function (source, label, next) {
    var Role = app.models.Role;
    var RoleMapping = app.models.RoleMapping;


    console.log("SOURCE:", source)
    console.log("LABEL:", label)

    var permission = source.grant
    //console.log("REPO_GRANT", app.PropertiesMap)
    console.log("PERMISSION", permission)

    if (source.grant.length > 1) {
      console.log("ENTRO")
      async.parallel([
        function (callback) {

          rm.addPrincipalIdToRole(app.PropertiesMap[label + permission.split('-')[0]].property,
            RoleMapping.USER, source.userId, function (cb) {
              console.log("[1]Callback from addPrincipalIdToRole", cb);
              callback()
            })
        },
        function (callback) {
          rm.addPrincipalIdToRole(app.PropertiesMap[label + permission.split('-')[1]].property,
            RoleMapping.USER, source.userId, function (cb) {
              console.log("[2]Callback from addPrincipalIdToRole", cb);
              callback()
            })
        }
      ], function (err) {
        console.log("-----------FINE-------------")
        if (!err) return next(true)
        else return next(false);

      });
    }
    else {
      console.log("SINGOLA RULE", source)
      rm.addPrincipalIdToRole(app.PropertiesMap[label + permission].property,
        RoleMapping.USER, source.userId, function (callback) {
          console.log("[3]Callback from addPrincipalIdToRole", callback);
          return next(true)
        })
    }

  }
  /**
   *   Assegno all'utente i permessi SOLO per il repository in req.params.repo_name
   * @param req
   * @param res
   * @param next
   * @constructor
   */
  Repository.ACLtoRepository = function(req,res,next) {
    console.log("grantAccess", req.body);
    validateGrantAccessBody(req.body,function(isvalidate){
      if(!isvalidate) return res.status(400).send({message: 'Bad payload'})
      console.log("Validate:",isvalidate);
      // it assign permissions to repository
      var payload = {
        "userId": isvalidate.userId,
        "grant": req.body.grant
      }
      grantPermissionsToUser(payload,'Repo',function(permission){
        if(permission) {
          var payload = {
            "repositoryName": req.params.repo_name,
            "collectionName": null,
            "userId": isvalidate.userId
          }
          app.models.access.create(payload, function (err, entry) {
            if (err) throw err;
            logger.debug("ACLs are successufully assigned to user. ACLs ID: ",entry);
            res.sendStatus(200);
          })
        }
      })
    })
  }





  /**
   * Assegno all'utente i permessi SOLO per la collection in req.params.collection_name
   * @param req
   * @param res
   * @param next
   * @constructor
   */
  Repository.ACLtoCollection = function(req,res,next) {
    console.log("grantAccess", req.body);
    validateGrantAccessBody(req.body,function(isvalidate){
      if(!isvalidate) return res.status(400).send({message: 'Bad payload'})
      console.log("Validate:",isvalidate);
      var payload = {
        "userId": isvalidate.userId,
        "grant": req.body.grant
      }
      grantPermissionsToUser(payload,'Coll',function(permission){
        if(permission) {
          if(req.body.item_grant) {
            console.log("ITEM_GRANT",req.body.item_grant);
            var payload = {
              "userId": isvalidate.userId,
              "grant": req.body.item_grant
            }
            grantPermissionsToUser(payload,'Item',function(permission){
              if(permission) {
                var payload = {
                  "repositoryName": req.params.repo_name,
                  "collectionName": req.params.collection_name,
                  "userId": isvalidate.userId
                }
                app.models.access.create(payload, function (err, entry) {
                  if (err) throw err;
                  logger.debug("ACLs are successufully assigned to user. ACLs ID: ",entry);
                  res.sendStatus(200);
                })
              }
            })
          } else {
            var payload = {
              "repositoryName": req.params.repo_name,
              "collectionName": req.params.collection_name,
              "userId": isvalidate.userId
            }
            app.models.access.create(payload, function (err, entry) {
              if (err) throw err;
              logger.debug("ACLs are successufully assigned to user. ACLs ID: ",entry);
              res.sendStatus(200);
            })
          }
        }
      })
    })
  }



  Repository.grantAccess = function (req, res, next) {
    console.log("grantAccess", req.body);
    console.log("PropertyMap", app.PropertiesMap)
    return res.status(200).send({message:'Disabled'})
/*
    validateGrantAccessBody(req.body, function (validate) {
      if (!validate) return res.status(400).send({message: 'Bad payload'})
      /!*if (req.body.repositoryPermission.grant.length >1) {
       var repo_grant = req.body.repositoryPermission.grant
       console.log("REPO_GRANT",app.PropertiesMap)
       //console.log("------------->RUOLO:",app.PropertiesMap['Repo'+repo_grant.split('-')[0]].property)
       //console.log("------------->RUOLO:",app.PropertiesMap['Repo'+repo_grant.split('-')[1]].property)
       async.parallel([
       function(callback) {

       rm.addPrincipalIdToRole(app.PropertiesMap['Repo'+repo_grant.split('-')[0]].property,
       RoleMapping.USER,'5630e21d481cf6072a68b57c',function(cb) {
       console.log("Callback from addPrincipalIdToRole", cb);
       callback
       })
       },
       function(callback) {
       rm.addPrincipalIdToRole(app.PropertiesMap['Repo'+repo_grant.split('-')[1]].property,
       RoleMapping.USER,'5630e21d481cf6072a68b57c',function(cb) {
       console.log("Callback from addPrincipalIdToRole", cb);
       callback
       })
       }
       ], function(err) {
       console.log('Repository ACL done');
       var payload = {
       "repositoryName":req.body.repositoryPermission.name,
       "collectionName":req.body.collectionsPermission.name,
       "userId":"5630e21d481cf6072a68b57c"
       }
       app.models.access.create(payload,function(err,entry){
       if(err) throw err;
       console.log("Entry",entry);
       res.sendStatus(200);
       })
       });

       }
       else
       {
       console.log("------------->RUOLO:",app.PropertiesMap['Repo'+req.body.repositoryPermission.grant].property)
       rm.addPrincipalIdToRole(app.PropertiesMap['Repo'+req.body.repositoryPermission.grant].property,
       RoleMapping.USER,'5630e21d481cf6072a68b57c',function(callback) {
       console.log("Callback from addPrincipalIdToRole", callback);
       callback
       })
       }*!/

      grantPermissionsToUser(req.body.repositoryPermission, 'Repo', function (callback) {
        if (callback) {
          console.log("Ritorno 1")

          grantPermissionsToUser(req.body.collectionsPermission, 'Coll', function (callback) {
            if (callback) {
              console.log("Ritorno 2")

              grantPermissionsToUser(req.body.itemsPermission, 'Item', function (callback) {
                if (callback) {
                  console.log("Ritorno 3")

                  console.log('Repository ACL done');
                  var payload = {
                    "repositoryName": req.body.repositoryPermission.name,
                    "collectionName": req.body.collectionsPermission.name,
                    "userId": "5630e21d481cf6072a68b57c"
                  }
                  app.models.access.create(payload, function (err, entry) {
                    if (err) throw err;
                    console.log("Entry", entry);
                    res.sendStatus(200);
                  })
                }
              })
            }
          })
        }
      })


    })
*/
  }


  /**
   *----- beforeRemote Hooks ------
   *
   *
   *
   * */

  Repository.beforeRemote('getRepository', function (context, user, final) {

    var res = context.res;
    rm.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        console.log("[getRepository][Status 401 Unauthorized]")
        res.status(401).send({"error": "You are not allowed to access this collection"})
      }
      if (allowed == 500) {
        res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        return final()
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


    rm.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        console.log("[createCollection][Status 401 Unauthorized]")
        res.status(401).send({"error": "You are not allowed to access this collection"})
      }
      if (allowed == 500) {
        console.log("[createCollection][Status 500]")
        res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        // validate Body
        tl.validatebody(req, res, function (cb) {
          if (cb) {
            // getRepository Model
            tl.getRepository(req, res, function (next) {
              if (next) {
                // check for duplicate
                app.repositoryModel.findOne({where: {"name": req.body.name}}, function (err, value) {
                  if (err) return res.send(JSON.stringify(err));
                  if (value) return res.status(409).send({error: "A collection named " + req.body.name + " is already defined"})
                  // get DataSource
                  tl.getDatasourceToWrite(req, res, function (next) {
                    // create Model and save to localdb
                    app.repositoryModel.create(app.bodyReadToWrite, function (err, instance) {
                      if (err) return res.send(JSON.stringify(err));
                      // create collection table reponame_collection
                      service.createTable(app.CollectionDataSource, app.bodyReadToWrite, function (callback) {
                        if (callback) return final()
                        else res.sendStatus(500);
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

    rm.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        console.log("[getCollection][Status 401 Unauthorized]")
        res.status(401).send({"error": "You are not allowed to access this collection"})
      }
      if (allowed == 500) {
        console.log("[getCollection][Status 500]")
        res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        return final()
      }
    })
  })
  Repository.beforeRemote('getCollectionItem', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    rm.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        console.log("[getCollection][Status 401 Unauthorized]")
        res.status(401).send({"error": "You are not allowed to access this collection"})
      }
      if (allowed == 500) {
        console.log("[getCollection][Status 500]")
        res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        tl.getCollection(req, res, function (next) {
          app.next_module.findById(req.params.item_id, function (err, item) {
            if (err) return res.sendStatus(500);
            if (!item) return res.sendStatus(404);
            else {
              console.log("ITEM", item)
              res.status(200).send(item);
            }
          })
        })
      }
    })
  })
  Repository.beforeRemote('populateCollection', function (context, user, final) {

    var req = context.req;
    var res = context.res;

    rm.isAllowed(context, function (allowed) {
      if (allowed == 401) {
        console.log("[populateCollection][Status 401 Unauthorized]")
        res.status(401).send({"error": "You are not allowed to access this collection"})
      }
      if (allowed == 500) {
        res.status(500).send({"error": "Server Error"})
      }
      if (allowed == 200) {
        tl.getCollection(req, res, function (next) {
          tl.createPersistedModel(req, res, function (next) {
            app.persistedModel.create(req.body, function (err, instance) {
              if (err) {
                return res.send(err);
              }
              else return final()
            })
          })
        })
      }
    })
  })

  Repository.beforeRemote('createRelation', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    tl.getRepository(req, res, function (next) {
      if (next) {
        tl.validateRelationBody(req, res, function (next) {
          if (next) {
            console.log("OK VALIDATE")
            final()
          } else res.sendStatus(412)
        })
      }
    })
  })
  Repository.beforeRemote('getRelation', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    tl.getCollection(req, res, function (next) {
      app.first_model = app.next_module;
      rl.buildRelation(req, res, function (relation) {
        final()
      })
    })
  })
  Repository.beforeRemote('getReplicas', function (context, user, final) {
    var req = context.req;
    var res = context.res;
    tl.getCollection(req, res, function (next) {
      final()
    })
  })
  Repository.beforeRemote('getReplicaById', function (context, user, final) {

    var req = context.req;
    var res = context.res;
    tl.getCollection(req, res, function (next) {
      console.log("app.next_module:", app.next_module.definition.name);
      final()
    })
  })

  Repository.afterRemote('find',function(context,user,final){

    for (var i=0; i< context.result.length; i++) {
      if(context.result[i].coll_db) {
        context.result[i].coll_db.password="********"
      }
    }
    final()

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


  Repository.remoteMethod('getCollection', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'instance', type: 'array'},
    http: {path: '/:repo_name/:collection_name', verb: 'get'}
  });

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


  Repository.remoteMethod('createRelation', {
    http: {path: '/:repo_name/:collection_name/relation', verb: 'post'},
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

  Repository.remoteMethod('uploadReplicaById', {
    http: {path: '/:repo_name/:collection_name/:item_id/_replicas/:replica_id', verb: 'put'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })


   Repository.remoteMethod('ACLtoRepository', {
     http: {path: '/:repo_name/_acls', verb: 'post'},
     accepts: [
       {arg: 'req', type: 'object', 'http': {source: 'req'}},
       {arg: 'res', type: 'object', 'http': {source: 'res'}}
     ],
     returns: {arg: 'data', type: 'object'}
   })

  Repository.remoteMethod('ACLtoCollection', {
    http: {path: '/:repo_name/:collection_name/_acls', verb: 'post'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })


  Repository.remoteMethod('grantAccess', {
    http: {path: '/grantAccess', verb: 'post'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })

  /*-------------------------------------OBSERVE---------------------------------------------------*/


  Repository.observe('access', function (context, final) {

    //context.query.where = { name : 'animals'};
    //context.query.fields = {'location':false,'coll_db.password': false, 'coll_db.username': false, 'coll_db.port': false, 'id': false}
    return final();
  })

  Repository.observe('before delete', function (ctx, final) {
    console.log('Going to delete %s matching %j',
      ctx.Model.pluralModelName,
      ctx.where, ctx.app);
    final();
  });

  Repository.observe('before save', function (context, final) {
    console.log('Going to create Repository');
    console.log("Body:", context.instance);
    var req = {body: context.instance};
    var res = context.result; // undefined

    tl.buildpayload(req, res, function (next) {
      if (!next) {
        error = sendError(400, 'Invalid request');
        final(error);
      }

      console.log("payload", app.bodyReadToWrite);
      var payload = app.bodyReadToWrite;
      Repository.findOne({where: {"name": req.body.name}}, function (err, value) {
        if (err) {
          error = sendError(500, err);
          final(error);
        }
        if (value) {
          msg = "A repository named " + context.instance.name + " is already defined";
          error = sendError(409, msg)
          final(error);
        } else {
          context.instance.path = payload.path;
          context.instance.location = payload.location;
          context.instance.coll_db = payload.coll_db;
          console.log("*-Body-*:", context.instance);
          final()
        }
      })
    })
  })


  Repository.observe('after save', function (context, final) {
    console.log('Going to POST SAVE Repository', context.instance);

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
        final();

      } else {
        error = sendError(500, 'Error during service CreateTable')
      }
    })

  })
}
