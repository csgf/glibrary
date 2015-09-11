/**
 * Created by Antonio Di Mariano on 03/09/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
//            collectionModel.hasMany(replica,{foreignKey: 'collectionId', as: 'collections'})
var logger = require("./logger");


module.exports = function (app) {
  var Replica = app.models.Replica;

  var testLib = require('./loadModel');
  var tl = new testLib(app);

  return {


    buildRelation: function buildRelation(req, res, next) {


      relatedModelName = req.params.repo_name + '_' + req.params.related_coll_name;
      first_model = next.module;
      console.log("first_model", relatedModelName);
      //   console.log("model.definition",model.definition.modelBuilder.definitions.relatedModel);
      if (next.module.definition.modelBuilder.definitions[relatedModelName]) {
        console.log("relatedTo PRESENTE ******************************************")
        next()
      } else {
        console.log("related NON PRESENTE **********************************")
        req.params.collection_name = req.params.related_coll_name;

        first_model.findById(req.params.item_id,
          function (err, instance) {
            if (err) {
              console.log("Relation Query Error:", err);
            }
            if (!instance) return res.sendStatus(404);

            tl.getCollection(req, res, function (cb) {
              related_model = app.next_module;
              fk = instance.relatedTo.fk;
              name = instance.relatedTo.name;
              first_model.hasMany(related_model, {foreignKey: fk, as:name});
              related_model.belongsTo(first_model,{foreignKey:fk});
              logger.debug("[buildRelation][setRelation hasMany]");
              app.relationName = name;
              return next();


            })
          })
      }

    },


    setModelRelation: function setModelRelation(firstModule, secondModule, fk, name, next) {
      console.log("SET MODEL RELATION", firstModule)
      firstModule.hasMany(secondModule, {foreignKey: fk, as: name});
      secondModule.belongsTo(firstModule, {foreignKey: fk});
      logger.debug("[setRelationTest][setRelationTest hasMany]");
      next('ok')

    },


    setReplicaRelation: function setReplicaRelation(req, res, next) {

      next.module.hasMany(Replica, {foreignKey: 'collectionId', as: 'replicas'});
      Replica.belongsTo(next.module, {foreignKey: 'collectionId'});
      logger.debug("[modelRelation][Setted hasMany replica]");
      next();

      /*
       next.module.find({
       include: 'replicas',

       },function(err,result){
       if(err) console.log(err);
       console.log("MIDDLE",result)
       })
       */
      /*
       next.module.find(req.query.filter, function (err, instance) {
       if (err) res.sendStatus(500);
       if (!instance) return res.sendStatus(404);
       console.log("MIDDLEWARE: ", instance);
       })
       */


    }
  }
}
