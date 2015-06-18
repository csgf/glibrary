module.exports = function mountRestApi(server) {
  var restApiRoot = server.get('restApiRoot');
  var repository = server.models.Repository;
  var app = require('../server.js');
  var bodyParser = require('body-parser');
  app.use(bodyParser.json()); // for parsing application/json. Once we  disabled restApiRoot, we need to enable all bodyParser functionalities

  var modelBuilder = require('../lib/ModelBuilder');


//  server.use(restApiRoot, server.loopback.rest());


  server.get('/repositories',function(req,res,next){
    repository.find(req.query.filter,function(err,value){
      if(err)  return res.sendStatus(500);
      return res.send(value);
    })
  })

  server.post('/repositories',function(req,res){

    repository.create(req.body,function(err,value){
      if(err) return res.send(JSON.stringify(err));
      return res.sendStatus(200,'Repository Created');
    })
  })

  server.get('/:repositories/:collection',function(req,res,next){

    var md = new modelBuilder(app);
    md.getModelInstanceByName(req.params.collection,function(model){
      if(model) {
        model.find(req.query.filter,function(err,value){
          if(err) return res.sendStatus(500);
          return res.send(value);
        })
      } else return res.sendStatus(404);
    })
  })

  server.get('/:collection/:entry',function(req,res,next){
    var md = new modelBuilder(app);
    md.getModelInstanceByName(req.params.entry,function(model){
      if(model) {
        model.find(req.query.filter,function(err,value){
          if(err) return res.sendStatus(500);
          return res.send(value);
        })
      } else return res.sendStatus(404);

    })
  })

  server.post('/:collection/:entry',function(req,res,next){
    var md = new modelBuilder(app);
    md.getModelInstanceByName(req.params.entry,function(model){
      if(model) {
        model.create(req.body,function(err,value){
          if(err) return res.send(JSON.stringify(err));
          return res.sendStatus(200,'Repository Created');
        })
      } else return res.sendStatus(404);
    })
  })
};
