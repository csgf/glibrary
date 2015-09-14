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

      var repository = app.models.Repository;

      relatedModelName = req.params.repo_name + '_' + req.params.related_coll_name;
      first_model = next.module;
      logger.debug("[buildRelation][relatedModelName] : ",relatedModelName);
      if (next.module.definition.modelBuilder.definitions[relatedModelName]) {
        logger.debug("[buildRelation] Relation has been builded with ",relatedModelName);
        next()
      } else {
        logger.debug("[buildRelation] Relation is not present. Let's build it");

        app.repositoryModel.findOne({where: {name: req.params.collection_name}},
          function (err, instance) {
            if (err) {
              logger.error("[buildRelation][Query Error]",err);
              res.sendStatus(500);
            }
            if (!instance) return res.sendStatus(404);
            req.params.collection_name = req.params.related_coll_name;
            tl.getCollection(req, res, function (cb) {
              related_model = app.next_module;
              fk = instance.relatedTo.fk;
              name = instance.relatedTo.name;

              first_model.hasMany(related_model, {foreignKey: fk, as: name});
              related_model.belongsTo(first_model, {foreignKey: fk});
              app.relationName = name;
              logger.debug("[buildRelation][setRelation hasMany] with ", app.relationName);
              return next();

            })
          })

        /*
        tl.getRepository(req, res, function (callback) {

          app.repositoryModel.findOne({where: {name: req.params.collection_name}},
            function (err, instance) {
              if (err) {
                logger.error("[buildRelation][Query Error]",err);
                res.sendStatus(500);
              }
              if (!instance) return res.sendStatus(404);
              req.params.collection_name = req.params.related_coll_name;
              tl.getCollection(req, res, function (cb) {
                related_model = app.next_module;
                fk = instance.relatedTo.fk;
                name = instance.relatedTo.name;

                first_model.hasMany(related_model, {foreignKey: fk, as: name});
                related_model.belongsTo(first_model, {foreignKey: fk});
                app.relationName = name;
                logger.debug("[buildRelation][setRelation hasMany] with ", app.relationName);
                return next();

              })
            })
        })
        */
      }

    },


    setModelRelation: function setModelRelation(firstModule, secondModule, fk, name, next) {
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
    }
  }
}
