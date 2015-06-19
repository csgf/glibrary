module.exports = function mountRestApi(server) {
  var restApiRoot = server.get('restApiRoot');
  var repository = server.models.Repository;
  var app = require('../server.js');
  var bodyParser = require('body-parser');
  var methodOverride = require('method-override');
  app.use(bodyParser.json()); // for parsing application/json. Once we  disabled restApiRoot, we need to enable all bodyParser functionalities
  app.use(methodOverride());
  var modelBuilder = require('../lib/ModelBuilder');


//  server.use(restApiRoot, server.loopback.rest());

// Repositories

  /**
   * Elenco di tutti i repositories hostati sul server
   */

  server.get('/v1/repos',function(req,res,next){
    repository.find(req.query.filter,function(err,value){
      if(err)  return res.sendStatus(500);
      return res.send(value);
    })
  })

  /**
   * Crea un nuovo repository
   */

  server.post('/v1/repos',function(req,res){

    repository.create(req.body,function(err,value){
      if(err) return res.send(JSON.stringify(err));
      return res.sendStatus(200,'Repository Created');
    })
  })


  //Collections

  /**
   * Elenco di tutte le collection del repository <repo_name>
   */

  server.get('/v1/repos/:repo_name',function(req,res,next){
    console.log("/repositories/:repo_name",req.params.repo_name)
    var modelName = req.params.repo_name.charAt(0).toUpperCase() + req.params.repo_name.substring(1);
    var model = app.models[modelName];
    if(model) {
        model.find(req.query.filter,function(err,value){
          if(err) return res.sendStatus(500);
          return res.send(value);
        })
      } else return res.sendStatus(404);

  })

  /**
   * Crea una nuova collection o importa una tabella di un db esistente come collection nel repository <repo_name>.
   * Il nome della collections viene passato come parametro nel body
   */
  server.post('/v1/repos/:repo_name',function(req,res,next){

    var modelName = req.params.repo_name.charAt(0).toUpperCase() + req.params.repo_name.substring(1);
    var model = app.models[modelName];
    if(model) {
        model.create(req.body,function(err,value){
          if(err) return res.send(JSON.stringify(err));
          return res.sendStatus(200,'Repository Created');
        })
      } else return res.sendStatus(404);
  })



  /**
   * Elenco di tutti gli item contenuti nella collection <collection_name>
   */
  server.get('/v1/repos/:repo_name/:collection_name',function(req,res,next){

    console.log("/:collection/:entry",req.params.collection_name);
    var modelName = req.params.repo_name.charAt(0).toUpperCase() + req.params.repo_name.substring(1);
    var model = app.models[modelName];
    if(model) {
        model.find({where: {typename:req.params.collection_name}},req.query.filter,function(err,value){
          if(err) return res.sendStatus(500);
          return res.send(value);
        })
      } else return res.sendStatus(404);
  })

  /**
   * Modifica i metadati della <collection_name_id>
   */

  server.put('/v1/repos/:repo_name/:collection_name_id',function(req,res,next){
    var modelName = req.params.repo_name.charAt(0).toUpperCase() + req.params.repo_name.substring(1);
    var model = app.models[modelName];
    if (model) {
        model.updateOrCreate(req.body, function (err) {
          if (err) res.sendStatus(500);
          return res.sendStatus(200);
        })
      } else return res.sendStatus(404);

  })

  /**
   * Cancella la collection <collection_name_id>
   */
  server.delete('/v1/repos/:repo_name/:collection_name_id',function(req,res,next){
    console.log("REQ:",req.params,req.body);
    var modelName = req.params.repo_name.charAt(0).toUpperCase() + req.params.repo_name.substring(1);
    var model = app.models[modelName];
    if(model) {
        model.deleteById(req.params.collection_name_id,function(err,value){
          if(err) res.sendStatus(500);
          return res.sendStatus(200);
        })
      } else return res.sendStatus(404);

  })

  //Items

  /**
   * POST /v1/repos/<repo_name>/<collection_name>/
   *  Crea un nuovo item nella collection <collection_name> con tutti i suoi metadati
   */
  server.post('/v1/repos/:repo_name/:collection_name',function(req,res,next){
    console.log("POST ITEM");
    md = new modelBuilder(app);
    var repositoryDB = app.dataSources.repoDB;

    md.persistData(repositoryDB,req.body,function(callback){
      console.log("PERSIST DTA");
      res.sendStatus(200,"Item created");
    })
  })

  /**
   * Restituisce i metadati di <item_name>
   */
  server.get('/v1/repos/:repo_name/:collection_name/:item_name',function(req,res,next){
    console.log("GET /v1/repos/:repo_name/:collection_name/:item_name");
    var modelName = req.params.item_name.charAt(0).toUpperCase() + req.params.item_name.substring(1);
    var model = app.models[modelName];
    if(model) {
      model.find(req.query.filter,function(err,value){
        if(err) return res.sendStatus(500);
        return res.send(value);
      })
    } else return res.sendStatus(404);

  })

  /**
   * Cancella l'item indicato
   */
  server.delete('/v1/repos/:repo_name/:collection_name/:item_name_id',function(req,res,next){
    var modelName = req.params.collection_name.charAt(0).toUpperCase() + req.params.collection_name.substring(1);
    var model = app.models[modelName];
    if(model) {
      model.deleteById(req.params.item_name_id,function(err,value){
        if(err) res.sendStatus(500);
        return res.sendStatus(200);
      })
    } else return res.sendStatus(404);
  })


};
