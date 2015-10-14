/**
 * created by Antonio Di Mariano on 6/6/2015
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
module.exports = function (Repository) {



  var isStatic = true;
  Repository.disableRemoteMethod('findById', isStatic);

  userId = null;

  var fs = require('fs');
  var https = require('https');
  var path = require('path');
  var request = require('request');
  var service = require('../service/persist');
  var logger = require("../helpers/logger");


  var sendError = function (code, msg) {

    var error = new Error();
    error.statusCode = code;
    error.message = msg
    delete error.stack;
    return error;
  }

  /**
   * Event Observe
   */




  Repository.observe('before delete', function (ctx, next) {
    console.log('Going to delete %s matching %j',
      ctx.Model.pluralModelName,
      ctx.where, ctx.app);
    next();
  });

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
     */
  }


  /* --- Repository -----*/

  Repository.createRepository = function (req, res, next) {
    console.log("[Repository.createRepository]");
  }

  Repository.getRepository = function (req, res, next) {
    console.log("[Repository.getRepository]")

    Repository.getApp(function (err, app) {
      var testLib = require('../helpers/loadModel');
      var tl = new testLib(app);
      tl.getRepository(req, res, function (next) {
        if (next) {
          console.log("Repository Model", app.repositoryModel.definition.name)
          app.repositoryModel.find(req.query.filter, function (err, instance) {
            if (err) {
              res.sendStatus(500)
            }
            if (!instance) {
              res.status(400).send({error: "Repository not Found"})
            }
            res.send(instance);
          })
        } else res.sendStatus(500)
      })
    })
  }

  /* ---- GET Collection ----*/

  Repository.getCollection = function (req, res, next) {

    console.log("[Repository.getCollection]", req.query.filter)
    Repository.getApp(function (err, app) {
      var testLib = require('../helpers/loadModel');
      var tl = new testLib(app);
      tl.getCollection(req, res, function (next) {
        app.next_module.find(req.query.filter, function (err, instance) {
          if (err) res.sendStatus(500);
          if (!instance) return res.sendStatus(404);
          res.json(instance);
        })
      })
    })
  }

  Repository.getCollectionSchema = function (req, res, next) {
    Repository.getApp(function (err, app) {
      var testLib = require('../helpers/loadModel');
      var tl = new testLib(app);
      console.log("GET collection SCHEMA");
      res.json(app.next_module.definition.properties);

    })
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


    Repository.getApp(function (err, app) {
      var testLib = require('../helpers/loadModel');
      var tl = new testLib(app);
      app.repositoryModel.findOne({where: {name: req.params.collection_name}},
        function (err, instance) {

          if (err) res.sendStatus(500);
          if (!instance) return res.status(404).send({"error": "Collection not found"});
          var relation_array = (!instance.relatedTo ? [] : instance.relatedTo)
          console.log("relation_array", relation_array);

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
    })

  }


  Repository.getRelation = function(req,res,next) {




  }



  /*----- beforeRemote Hooks ------*/

  Repository.beforeRemote('getColletionItem', function (context, user, final) {
    Repository.getApp(function (err, app) {
      var testLib = require('../helpers/loadModel');
      var tl = new testLib(app);
      var req = context.req;
      var res = context.res;
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

    })
  })

  Repository.beforeRemote('populateCollection', function (context, user, final) {
    Repository.getApp(function (err, app) {
      var testLib = require('../helpers/loadModel');
      var tl = new testLib(app);
      var req = context.req;
      var res = context.res;
      tl.getCollection(req, res, function (next) {
        tl.createPersistedModel(req, res, function (next) {
          app.persistedModel.create(req.body, function (err, instance) {
            if (err) {
              res.send(err);
            }
            else final()

          })
        })
      })
    })
  })

  Repository.beforeRemote('createCollection', function (context, user, final) {
    Repository.getApp(function (err, app) {
      var testLib = require('../helpers/loadModel');
      var tl = new testLib(app);
      var req = context.req;
      var res = context.res;
      console.log("BODY:", req.body)
      tl.validatebody(req, res, function (cb) {
        if (cb) {
          console.log("CB", cb)

          tl.getRepository(req, res, function (next) {
            if (next) {
              console.log("repocb", app.repositoryModel.definition.name)
              app.repositoryModel.findOne({where: {"name": req.body.name}}, function (err, value) {
                // GENERA ERRORE NNESISTE IL RES
                if (err) return res.send(JSON.stringify(err));
                if (value) return res.status(409).send({error: "A collection named " + req.body.name + " is already defined"})
                tl.getDatasourceToWrite(req, res, function (next) {
                  console.log("NEXT", app.CollectionDataSource.settings.host)
                  app.repositoryModel.create(app.bodyReadToWrite, function (err, instance) {
                    if (err) return res.send(JSON.stringify(err));
                    console.log("BODY", app.bodyReadToWrite)
                    service.createTable(app.CollectionDataSource, app.bodyReadToWrite, function (callback) {
                      if (callback) final()
                      else res.sendStatus(500);
                    })
                  })
                })
              })
            }
          })
        }
      })
    })
  })

  Repository.beforeRemote('getCollection', function (context, user, next) {
    /*var req = context.req;
     req.body.publisherId = "CIAO";
     userId = "PIPPOPAPPO";
     */
    next();
  })

  Repository.beforeRemote('createRelation',function(context,user,final) {

    Repository.getApp(function (err, app) {
      var testLib = require('../helpers/loadModel');
      var tl = new testLib(app);
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
  })

  Repository.beforeRemote('createRelation',function(context,user,final) {

    Repository.getApp(function (err, app) {
      var testLib = require('../helpers/loadModel');
      var tl = new testLib(app);
      var req = context.req;
      var res = context.res;
      tl.getCollection(req, res, function (next) {
        if(next) {

        }
      })


    })
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
      {arg: 'req', type: 'object', 'http': {source: 'body'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  });

  Repository.remoteMethod('populateCollection', {
    http: {path: '/:repo_name/:collection_name/', verb: 'post'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'body'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  });

  Repository.remoteMethod('getColletionItem', {
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
    http: {path : '/:repo_name/:collection_name/:item_id/:related_coll_name', verb:'get'},
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}}
    ],
    returns: {arg: 'data', type: 'object'}
  })
  /*-------------------------------------OBSERVE---------------------------------------------------*/

  /*
   Repository.observe('access', function(context,next){

   console.log("CNTEXT",context.query)
   if (context.query.where) {
   context.query.where.id = "561e4f9b3a3ecaeb73e12b2c";
   }
   next();
   })

   */

  Repository.observe('before save', function (context, final) {
    console.log('Going to create Repository');
    console.log("Body:", context.instance);

    Repository.getApp(function (err, app) {

      var testLib = require('../helpers/loadModel');
      var tl = new testLib(app);
      var req = {body: context.instance};
      var res = context.result;
      console.log("Body:", req.body.name);
      console.log("PAR:", req.params);

      tl.buildpayload(req, res, function (next) {
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
  })


  Repository.observe('post save', function (context, final) {
    console.log('Going to POST SAVE Repository');
    Repository.getApp(function (err, app) {

      var repositoryDB = app.dataSources.repoDB;

      service.createTable(repositoryDB, app.bodyReadToWrite, function (callback) {
        if (callback) {
          var code = 201;
          var message = "The repository was successfully created";
          var response = {code: code, message: message}
          final(response);
        } else {
          error = sendError(500, 'Error during service CreateTable')
        }
      })
    })
  })
}
