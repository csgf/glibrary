module.exports = function mountRestApi(server) {
  var restApiRoot = server.get('restApiRoot');
  server.use(restApiRoot, server.loopback.rest());
  var repository = server.models.Repository;


  server.get('/repositories',function(req,res,next){
    repository.find(function(err,value){
      if(err) throw err;
      console.log("**value",value);
      return res.send(value);
    })
  })
  server.get('/:repository/:collection',function(req,res,next){



    repository.findOne({
      where: {"name":req.params.repository},
    },function(err,value){
      if(err) throw err;
      console.log("[value]",value);

     // var modello = server.models.value.name;
      var modello = server.models.Verga;
      modello.find({
        order: 'id DESC',
        limit: 3,
        fields: {id: true, typename: true, type: true}
      },function(er,v){
        if(er) throw er;
        return res.send(v);
      })
    })
  })

};
