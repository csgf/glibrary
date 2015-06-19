module.exports = function(Repository) {

  userId = null;
  var modelBuilder = require('../../server/lib/ModelBuilder');

  var fs = require('fs');
  var https = require('https');
  var path = require('path');
  var request = require('request');

  /**
   * Event Observe
   */


  Repository.observe('before save', function(ctx, next) {
    //creo dinamicamente il modello, passando i dati ricevuti in POST
    console.log("[Repository][Observe] Model name",JSON.stringify(ctx.instance.name, null,4));
    console.log("[Repository][CTX DATA]", JSON.stringify(ctx));
    if (ctx.instance) {

      //console.log('Saved %s#%s---->', ctx.Model.modelName, ctx.instance.id);
      Repository.getApp(function(err,app) {
        var postgreSQL = app.dataSources.postgreSQL;
        md = new modelBuilder(app);
        var data = ctx.instance;
        data.startbeforeRemote = true;
        console.log("DATA----->>>>>", data);
        /*
         md.createDynamicModel(postgreSQL,data,function(cb) {
         console.log("RITORNO:::::::",cb);
         });
         */
      })
    } else {
      console.log('[Repository]Updated %s matching %j',
        ctx.Model.pluralModelName,
        ctx.where
      );
    }
    next();
  });

  Repository.observe('after save', function(context,next){
    if (context.instance) {

      console.log("CTX:",context.instance);
      Repository.getApp(function(err,app) {
        var repoDB = app.dataSources.repoDB;
        var table_name = context.instance.name;
        var schema_collection = {
          "name": table_name,
          "base": "PersistedModel",
          "options": {
            "idInjection": false,
            "postgresql": {
              "schema": "public",
              "table": table_name
            }
          },
          "properties": {
            "id": {
              "type": "String",
              "id": true
            },
            "TypeName": {
              "type": "String",
              "lenght": 20
            },
            "Path": {
              "type": "String",
              "lenght": 20
            },
            "VisibleAttrs": {
              "type": "String",
              "lenght": 20
            },
            "FilterAttrs": {
              "type": "String",
              "lenght": 20
            },
            "ColumnWidth": {
              "type": "String",
              "lenght": 20
            },
            "ParentID": {
              "type": "number"
            },
            "Type": {
              "type": "number"
            }
          }
        }
        var collectionModel = app.model.collection;
        repositoryModel = repoDB.createModel(schema_collection.name, schema_collection.properties, schema_collection.options)
        repoDB.autoupdate(schema_collection.name,function (err,result) {
          repoDB.discoverModelProperties(table_name, function (err, props) {
            if (err) throw err;
            md = new modelBuilder(app);
            var data = {
              path : context.instance.path,
              name:  context.instance.name,
              location : context.instance.location,
              owner_id : context.instance.ownerId,
              subrepo : context.instance.subrepo

            }
            console.log('Saved %s#%s', context.Model.modelName, context.instance.id,context.isNewInstance);
            collectionModel = Repository.app.models.Collection;
            repositoryModel.hasMany(collectionModel,{foreignKey: 'repoId', as: 'collections'})
            // mappo il nuovo modello ed espongo API
            md.mapTableToModel(repoDB,data,function(callback){
              console.log("mapTableToModel callback",callback);
              next();
            })
          })
        });
      })
    } else {
      console.log('Updated %s matching %j',
        context.Model.pluralModelName,
        context.where);
    }

  /*
    Repository.getApp(function(err,app) {

      var repoDB = app.dataSources.repoDB;
      var schema_collection = {
        "name": "deroberto",
        "options": {
          "idInjection": false,
          "postgresql": {
            "schema": "public",
            "table": "deroberto"
          }
        },
        "properties": {
          "TypeName": {
            "type": "String",
            "lenght": 20
          },
          "Path": {
            "type": "String",
            "lenght": 20
          },
          "VisibleAttrs": {
            "type": "String",
            "lenght": 20
          },
          "FilterAttrs": {
            "type": "String",
            "lenght": 20
          },
          "ColumnWidth": {
            "type": "String",
            "lenght": 20
          },
          "ParentID": {
            "type": "number"
          },
          "id": {
            "type": "number"
          },
          "Type": {
            "type": "number"
          }
        }
      }
      repoDB.createModel(schema_collection.name, schema_collection.properties, schema_collection.options);
      repoDB.automigrate(function () {
        repoDB.discoverModelProperties('deroberto', function (err, props) {
          if(err) throw err;
          console.log("---->");
          next();
        });
      });
    })

  */

  })


  Repository.remoteMethod('openstack_login', {
    returns :{ arg : 'client', type: 'object'},
    http: {path:'/openstackLogin', verb:'get'}
  })

  Repository.remoteMethod('testhttps',{
    returns :{ arg : 'client', type: 'object'},
    http: {path:'/testRequest', verb:'get'}
  })

  Repository.remoteMethod('login_repository', {
    accepts: {arg: 'req', type: 'object',http:{source : 'body'}},
    returns: {arg: 'repositories', type: 'array'},
    http: {path:'/login_repository', verb: 'post'}
  });

  Repository.beforeRemote('list_repositories',function(context,user,next){
    var req = context.req;
    req.body.publisherId = req.accessToken.userId;
    userId = req.accessToken.userId;
    next();
  })


  /* ho creato un POST a /api/repositories per creare un nuovo endpoint */


  /*
   Repository.createSubRepository = function(data,cb) {
   console.log("[Repository][createSubRepository with DATA]:", data);

   var $path = data.path;
   var $modelName = data.name;
   var $table_name = data.location;

   Repository.getApp(function(err,app){
   if(err) throw err;
   var postgreSQL = app.dataSources.postgreSQL;

   postgreSQL.discoverAndBuildModels($table_name,
   { schema : 'public',
   base   : 'PersistedModel',
   name   : $table_name,
   plural : $path,
   http   :  { "path" : $path }
   },

   function(er, models) {
   if(er) throw  er;
   //console.log(util.inspect(models));
   for ( var m in models) {
   var model = models[m];
   model.setup();
   app.model(model);

   model.observe('*.save', function(ctx,next){
   console.log("[Repository][OBSERVE before save] Accedo al metodo creato dinamicamente");
   next();
   })

   model.beforeRemote('*',function(context,user,next) {
   console.log("[Repository][beforeRemote *] Accedo al metodo creato dinamicamente");
   if(context.method.http.verb == 'post') {
   var req = context.req
   //creo voce nel repository. Esempio /pirandello/opere
   console.log("POST METHOD ->>> REQ:",req.body);
   Repository.createSubRepository(req.body,function(cb){
   console.log("[Repository][recursive call]",cb);
   })
   next();
   } else next();
   })
   }
   console.log('[*Access new Model at *]: ', $path);
   cb('BUILD:OK. ');
   })
   })}

   */
  /*
   **************************************************************************************
   * /

   /*
   **************************************************************************************
   * GET /api/repositories/list_repositories
   */

  Repository.list_repositories = function(next) {
    Repository.find({
      where: {
        ownerId: userId
      }
    }, next);
  };
  Repository.remoteMethod('list_repositories', {
    returns: {arg: 'repositories', type: 'array'},
    http: {path:'/list_repositories', verb: 'get'}
  });


  Repository.openstack_login = function (req,next) {

    var client = require('pkgcloud').storage.createClient({
      provider : 'openstack',
      username : 'acaland',
      password : 'demo2015',
      tenantName : 'glibrary',
      authUrl : 'https://stack-server-01.ct.infn.it:35357/',
      options : {
        ca:      fs.readFileSync(path.join(__dirname,'../../server/private/INFNCA.pem')).toString()


      }
    });


    client.getContainers(function (err, containers) {
      if(err) throw err;
      console.log("****CONTAINERS****:");
      containers.forEach(function(value){
        console.log("VALUE:",value.name);
      })
    })

    client.getFiles('demo',function(err,files){
      if (err) throw err;
      // console.log("FILES:",files);
    })
    client.getFile('demo','ananas33.jpg',function(err,server){
      // console.log("GETFILE:",server);
    })
    client.download({
      container: 'demo',
      remote: 'ananas33.jpg'
    }).pipe(fs.createWriteStream('download_ananas33.jpg'));


  }
  Repository.testhttps = function(req,next) {


    var testData ={"uri":"https://stack-server-01.ct.infn.it:35357/v2.0/tokens",
      "method":"POST",
      "headers":{"User-Agent":"nodejs-pkgcloud/1.2.0-alpha.0",
        "Content-Type":"application/json","Accept":"application/json"},
      "json":{"auth":{"passwordCredentials":{"username":"acaland","password":"demo2015"},"tenantName":"glibrary"}},
      "ca":"-----BEGIN CERTIFICATE-----\nMIIDczCCAlugAwIBAgIBADANBgkqhkiG9w0BAQUFADAuMQswCQYDVQQGEwJJVDEN\nMAsGA1UEChMESU5GTjEQMA4GA1UEAxMHSU5GTiBDQTAeFw0wNjEwMDMxNDE2NDda\nFw0xNjEwMDMxNDE2NDdaMC4xCzAJBgNVBAYTAklUMQ0wCwYDVQQKEwRJTkZOMRAw\nDgYDVQQDEwdJTkZOIENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\nzpWODoOVnUKpyikjyrdj+QpJuoJeKkqF4fbd6LrqeQL0dqAiluVR8D4y/T2Mqvsd\nH/fg0s3EYZUDQZimcAmC3ammTX3rqXOz34GWLGpXoXAmUVKWPNFJo6rAEwhw3Sja\na8mEjMiZE/JigHN5RI8K6taKtjL/jE4XUTZOGbvlKsROxzJPM6bO4GJdYO+qhK9E\n5HsbV699DYyukBfUB6ChtD6GDbcdPKUKwheni5j0v6smFjiBEb3VQg4O+uBWTHMP\n116L9kPY+I7ojzXLuayMTd+6TXzunR33+v6h8AtLChcQRt4vj7oG/scTg3eSnFsq\noEO4D4IF9v481GJJwg58LwIDAQABo4GbMIGYMA8GA1UdEwEB/wQFMAMBAf8wDgYD\nVR0PAQH/BAQDAgEGMB0GA1UdDgQWBBTRYvOzd3LILvvyeRpvN04nnxPVIDBWBgNV\nHSMETzBNgBTRYvOzd3LILvvyeRpvN04nnxPVIKEypDAwLjELMAkGA1UEBhMCSVQx\nDTALBgNVBAoTBElORk4xEDAOBgNVBAMTB0lORk4gQ0GCAQAwDQYJKoZIhvcNAQEF\nBQADggEBAHjX0z+3P3JyQGIBI5aAXOS3NuDEf0MdqCLFIGsXjtvIm2kDSMSGQOg5\nuZnJLTAhaT+gX5eNkDdzhuuJEgW1FPGDy2If6zgD4T4EsS50E+L5BTNOG78UzF4H\n9DGBlbrkD8VEug9RpxGusSweGGlnO6CT/U1Tb3XY5ZjIrMubh09UwmjK9nEIe3vC\nRPInAkbmamteezpKOqC5Knj0ZpqU+CnWkuyYnjslX1e9O5lbupLTp5NOqZRCFn1i\niTjpoNefgqLE3sHedgb2P1vS8lO+EIhRnWgfN9qAHSqkQ+ZObxIfPJFdcluu8d/K\ntXsFkKmmFuEHd0SrYpBh9ZCLDgq2x9Y=\n-----END CERTIFICATE-----\n"};
    var cert = fs.readFileSync(path.join(__dirname,'../../server/private/INFNCA.pem')).toString();

    var requestData = {
      auth: {
        'tenantName': 'glibrary',
        'passwordCredentials': {
          'username': 'acaland',
          'password': 'demo2015'
        }
      }
    }

    request(testData,function(err,response,body){
      if (err) throw err;
      console.log("RES",response.statusCode);
      console.log("BODY",body);
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





  /*
   **************************************************************************************
   */


/*
  intercetto la query e cambio parametri

  Repository.observe('access',function setId(ctx,next){
    if(ctx.query.where) {
      Repository.getApp(function(err,app) {

        Verga = app.models.Verga;
        console.log('ID:',ctx.query.where.id);
        Verga.findOne({
          where: {"typename": ctx.query.where.id}
        },function(err,result){
          if(err) throw err;
          console.log("RESULT",result);
          ctx.query.where.id = result.id;
          return next();
        })
      })
    }else {
      next();
    }

  })
*/


  /*
   Repository.on('attached', function() {

   var override = Repository.find;
   Repository.find = function(filter,callback) {

   override.call(Repository,function(err,results){
   console.log("RESULTS",results);
   })
   console.log("OVERRRIDE");
   return override.apply(this,arguments);
   }
   })
   */
};
