module.exports = function mountRestApi(server) {
  var restApiRoot = server.get('restApiRoot');

  var events = require('events');
  var eventEmitter = new events.EventEmitter();


  var repository = server.models.Repository;
  var app = require('../server.js');
  var bodyParser = require('body-parser');
  var methodOverride = require('method-override');
  app.use(bodyParser.json()); // for parsing application/json. Once we  disabled restApiRoot, we need to enable all bodyParser functionalities
  app.use(methodOverride());//Catch json error

  app.use (function (error, req, res, next){
  console.log("CATCH ERRORE")
    if(error instanceof SyntaxError) {
      console.trace();
      console.error(error);
      res.sendStatus(400);
    }else next();

  });

  app.use(restApiRoot, server.loopback.rest());
  var repositoryDB = app.dataSources.repoDB;
  var service = require('../../common/service/persist');
  var testLib = require('../../common/helpers/loadModel');
  var tl = new testLib(app);


  /**
   *
   *  REPOSITORIES
   *
   */

    //Elenco di tutti i repositories hostati sul server

  server.get('/v1/repos', function (req, res, next) {
    repository.find(req.query.filter, function (err, instance) {
      if (err)  return res.send(JSON.stringify(err));
      if(!instance) return res.sendStatus(404);
      return res.send(instance);
    })
  })


  //Crea un nuovo repository

  server.post('/v1/repos',function (req, res) {
    console.log(" POST repos  ");

    repository.create(req.body, function (err, instance) {
      if (err) return res.send(JSON.stringify(err));



      service.createTable(repositoryDB, req.body, function (callback) {
        if (callback)  return res.sendStatus(200, 'Repository Created');
        else           return res.sendStatus(500);
      })
    })
  })

  server.put('/v1/repos/:repo_name', function (req, res, next) {
    console.log("SIAMO QUI", req.params.repo_name);
    repository.findOne({where: {name: req.params.repo_name}},
      function (err, instance) {
        if (err) res.sendStatus(500);
        if(!instance) return res.sendStatus(404);
        instance.updateAttributes(req.body, function (err) {
          res.sendStatus(200, 'repository updated')
        })
      })
  })


  server.delete('/v1/repos/:repo_name', function (req, res, next) {
    console.log("REPO", req.params.repo_name);
    /*
     repository.destroyById(3,function(err){
     return res.sendStatus(200);
     })
     */
    repository.findOne({where: {name: req.params.repo_name}},
      function (err, instance) {
        if(!instance) return res.sendStatus(404);
        // instance.destroy(function (callback) {
        repository.destroyById(instance.id, function (err) {
          if (err) return res.sendStatus(500);
          console.log("delete repository instance", instance.location);
          ld.removeModel(req, res, function (cb) {
            return res.sendStatus(200)
          })
        })

        //  })


      })
  })


  /**
   *
   * COLLECTIONS
   *
   */


    //Elenco di tutte le collection del repository <repo_name>
  server.get('/v1/repos/:repo_name', tl.getRepository, function (req, res, next) {

 // server.get('/v1/repos/:repo_name', ld.getRepository, function (req, res, next) {

    next.module.find(req.query.filter, function (err, instance) {
      if (err) res.send(err);
      if(!instance) return res.sendStatus(404);
      res.send(instance);
    })
  });

  /**
   * Crea una nuova collection o importa una tabella di un db esistente come collection nel repository <repo_name>.
   * Il nome della collections viene passato come parametro nel body
   */
  server.post('/v1/repos/:repo_name', tl.getRepository,tl.getDatasourceToWrite, function (req, res, next) {

  //server.post('/v1/repos/:repo_name', ld.getRepository,ld.getDatasourceToWrite, function (req, res, next) {
    console.log("POST /v1/repos/:repo_name");
    next.module.create(req.body, function (err, instance) {
      if (err) return res.send(JSON.stringify(err));

      service.createTable(app.CollectionDataSource, req.body, function (callback) {
        if (callback)  res.sendStatus(200, 'Repository Created');
        else          res.sendStatus(500);
      })

    })

  })


  server.head('/v1/repos/:repo_name/:collection_name',tl.getCollection,function(req,res,next){

    console.log("MODELLO",next.module.definition.rawProperties); // stampa properties del modello


    res.end(next.module.definition.rawProperties);

  })

  server.get('/v1/repos/:repo_name/:collection_name/_schema',tl.getCollection,function(req,res,next){
    console.log("GET collection SCHEMA");
    res.json(next.module.definition.properties);

  })

  //Elenco di tutti gli item contenuti nella collection <collection_name>
  server.get('/v1/repos/:repo_name/:collection_name', tl.getCollection, function (req, res, next) {
    console.log("GET collection_name")
    next.module.find(req.query.filter, function (err, instance) {
      if (err) res.sendStatus(500);
      if(!instance) return res.sendStatus(404);
      res.json(instance);
    })
  })
  //Modifica i metadati della <collection_name_id>
  server.put('/v1/repos/:repo_name/:collection_name', tl.getCollection, function (req, res, next) {
    console.log("PUT /v1/repos/:repo_name/:collection_name")
    next.module.findOne({where: {name: req.body.name}},
      function (err, instance) {
        if (err) res.sendStatus(500);
        if(!instance) return res.sendStatus(404);
        instance.updateAttributes(req.body, function (err) {
          res.sendStatus(200, 'repository updated')
        })
      })
  })

  /**
   * Cancella la collection <collection_name_id>
   */
  server.delete('/v1/repos/:repo_name/:collection_name', tl.getRepository, function (req, res, next) {
    console.log("DELETE COLLECTION:", req.params.collection_name);
    next.module.findOne({where: {name: req.params.collection_name}},
      function (err, instance) {
        if(err) return res.sendStatus(500);
        if(!instance) return res.sendStatus(404);
        instance.destroy(function (err) {
          if (err) return res.sendStatus(500)
          else {
            console.log("delete repository instance", instance.location);
            req.params.pathToDelete = req.params.collection_name;
            tl.removeModel(req, res, function (cb) {
              return res.sendStatus(200)
            })

          }
        })
      })
  })

  /**
   *  ITEMS
   */

  /**
   * POST /v1/repos/<repo_name>/<collection_name>/
   *  Crea un nuovo item nella collection <collection_name> con tutti i suoi metadati
   */
  server.post('/v1/repos/:repo_name/:collection_name', tl.getCollection, function (req, res, next) {
    next.module.create(req.body, function (err, instance) {
      if (err) res.send(err);
      else res.sendStatus(200, 'Items created');
    })
  })

  // Restituisce i metadati di <item_name>
  server.get('/v1/repos/:repo_name/:collection_name/:item_id', tl.getCollection, function (req, res, next) {
    console.log("GET /v1/repos/:repo_name/:collection_name/:item_id", req.params.collection_name, req.params.item_id);
    next.module.findById(req.params.item_id, function (err, item) {
      if (err) return res.sendStatus(500);
      if (!item) return res.sendStatus(404);
       else return res.send(item);
    })
  })
  // aggiorna item
  server.put('/v1/repos/:repo_name/:collection_name/:item_id', tl.getCollection, function (req, res, next) {
    console.log(" PUT /v1/repos/:repo_name/:collection_name/:item_id ");
    next.module.findById(req.params.item_id,
      function (err, instance) {
        if (err) return res.sendStatus(500)
        if(!instance) return res.sendStatus(404);
        else {
          instance.updateAttributes(req.body, function (err) {
            if (err) return res.sendStatus(500)
            else return res.sendStatus(200, 'item updated');
          })
        }
      })
  })

  // Cancella item
  server.delete('/v1/repos/:repo_name/:collection_name/:item_id', tl.getCollection, function (req, res, next) {

    console.log("DELETE ITEM:", req.params.item_id);
    next.module.findById(req.params.item_id,
      function (err, instance) {
        if(!instance) return res.sendStatus(404);
        instance.destroy(function (err) {
          if (err) return res.sendStatus(500)
          else {
            console.log("delete item instance", instance.location);
            req.params.repo_name = req.params.collection_name;
            ld.removeModel(req, res, function (cb) {
              return res.sendStatus(200)
            })
          }
        })
      })
  })

};
