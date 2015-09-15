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

      relatedModelName = req.params.repo_name + '_' + req.params.related_coll_name;
      first_model = next.module;
      repo = camelize(req.params.repo_name).trim().capitalize().value()
      coll = camelize(req.params.related_coll_name).trim().capitalize().value()

      if (next.module.definition.modelBuilder.definitions[relatedModelName] ||
        next.module.definition.modelBuilder.definitions[repo+coll]


      ) {
        app.relationName = RelationInfo[req.params.collection_name].relationName;
        logger.debug("[buildRelation][Found Relation with]", app.relationName);
        next()
      } else {
        logger.debug("[buildRelation][Bulding Relation with] ",req.params.collection_name);

        tl.getRepository(req, res, function (callback) {
          /*
          app.repositoryModel.findOne(function (e, d) {
            console.log("DATI REPOSITORY MODEL", d);
          })
          */

          app.repositoryModel.findOne({where: {name: req.params.collection_name}},
            function (err, instance) {
              if (err) {
                logger.error("[buildRelation][Query Error]", err);
                res.sendStatus(500);
              }
              if (!instance) {
                logger.error("[buildRelation][404 Error]", err);
                return next();
                //return res.sendStatus(404);
              }
              var coll_name = req.params.collection_name
              req.params.collection_name = req.params.related_coll_name;
              tl.getCollection(req, res, function (cb) {

                related_model = app.next_module;
                fk = instance.relatedTo.fk;
                name = instance.relatedTo.name;
                first_model.hasMany(related_model, {foreignKey: fk, as: name});
                related_model.belongsTo(first_model, {foreignKey: fk});
                app.relationName = name;
                RelationInfo[coll_name] =  { relationName :name };

                return next();

              })
            })
        })
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
