/**
 * Created by Antonio Di Mariano on 03/09/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
var logger = require("./logger");
var camelize = require('underscore.string');

var RelationInfo = {}



module.exports = function (app) {
  var Replica = app.models.Replica;

  var testLib = require('./loadModel');
  var tl = new testLib(app);

  return {


    buildRelation: function buildRelation(req, res, next) {

      var repository = app.models.Repository;


      first_model = (!next.module ? app.next_module : next.module)
     // first_model = next.module;

      if (RelationInfo[req.params.collection_name] &&
        RelationInfo[req.params.collection_name].relationName &&
        RelationInfo[req.params.collection_name].relatedModel == req.params.related_coll_name
      )
      {
        app.relationName = RelationInfo[req.params.collection_name].relationName;
        logger.debug("[buildRelation][Found Relation with]", app.relationName);
        next()
      } else {
        logger.debug("[buildRelation][Bulding Relation with] ", req.params.collection_name);

        tl.getRepository(req, res, function (callback) {
          app.repositoryModel.findOne({where: {name: req.params.collection_name}},
            function (err, instance) {
              if (err) {
                logger.error("[buildRelation][Query Error]", err);
                res.sendStatus(500);
              }
              if (!instance) {
                logger.error("[buildRelation][404 Error]", err);
                return next();
              }
              var coll_name = req.params.collection_name
              var itemfound=false;
              console.log("INSTANCE:",instance);
              console.log("req.params.collection_name",req.params.collection_name);
              var arrayFound = instance.relatedTo.filter(function(item) {

                if( item.relatedCollection == req.params.related_coll_name) {
                  console.log("ITEM:",item)
                  itemfound = true;
                  req.params.collection_name = req.params.related_coll_name;
                  tl.getCollection(req, res, function (cb) {

                    // verificare stato della callback

                    related_model = app.next_module;
                    fk = item.fk;
                    name = item.name;

                    console.log(" related_model:",related_model.definition.name);

                    first_model.hasMany(related_model, {foreignKey: fk, as: name});
                    related_model.belongsTo(first_model, {foreignKey: fk});
                    app.relationName = name;
                    RelationInfo[coll_name] = {relationName: name, relatedModel: req.params.related_coll_name};
                    return next();

                  })
                }
              });
              if (!itemfound) return res.status(400).send({"error":"Relation not found"})

            })

        })
      }

    },


    setModelRelation: function setModelRelation(firstModule, secondModule, fk, name, next) {
      firstModule.hasMany(secondModule, {foreignKey: fk, as: name});
      secondModule.belongsTo(firstModule, {foreignKey: fk});
      logger.debug("[setRelationTest][setRelationTest hasMany]");
      console.log("firstmodule",firstModule.definition.name);
      console.log("secondmodule",secondModule.definition.name);
      console.log("fk",fk);
      console.log("name",name)
      next('ok')

    },

    setReplicaRelation: function setReplicaRelation(req, res, next) {

      //next.module.hasMany(Replica, {foreignKey: 'collectionId', as: 'replicas'});
      console.log("setReplicaRelation app.next_module:", app.next_module.definition.name);

      app.next_module.hasMany(Replica, {foreignKey: 'collectionId', as: 'replicas'});
      Replica.belongsTo(app.next_module, {foreignKey: 'collectionId'});
      logger.debug("[modelRelation][Setted hasMany replica]");
      next(true);
    }
  }
}
