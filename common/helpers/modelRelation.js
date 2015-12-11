/**
 * Created by Antonio Di Mariano on 03/09/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */

module.exports = function (app) {
  var logger = require("./logger");
  var RelationInfo = {}
  var Replica = app.models.Replica;
  var loadModel = require('./loadModel');
  var _loadModel = new loadModel(app);

  return {

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    buildRelation: function buildRelation(req, res, next) {

      first_model = (!next.module ? app.next_module : next.module)
      if (RelationInfo[req.params.collection_name] &&
        RelationInfo[req.params.collection_name].relationName &&
        RelationInfo[req.params.collection_name].relatedModel == req.params.related_coll_name
      ) {
        app.relationName = RelationInfo[req.params.collection_name].relationName;
        logger.debug("[buildRelation][Found Relation with]", app.relationName);
        next()
      } else {
        logger.debug("[buildRelation][Bulding Relation with] ", req.params.collection_name);
        _loadModel.buildRepositoryModel(req, res, function (callback) {
          app.repositoryModel.findOne({where: {name: req.params.collection_name}},
            function (err, instance) {
              if (err) {
                logger.error("[buildRelation][Query Error]", err);
                return res.status(500).send({error: err});
              }
              if (!instance) {
                logger.error("[buildRelation][404 Error]", err);
                return next();
              }
              var coll_name = req.params.collection_name
              var itemfound = false;
              logger.debug("[buildRelation][req.params.collection_name]: ", req.params.collection_name);
              var arrayFound = instance.relatedTo.filter(function (item) {

                if (item.relatedCollection == req.params.related_coll_name) {
                  itemfound = true;
                  req.params.collection_name = req.params.related_coll_name;
                  _loadModel.buildCollectionModel(req, res, function (cb) {
                    if (!cb) {
                      logger.error("[buildRelation][Error in callback from  _loadModel.buildCollectionModel]")
                    }
                    related_model = app.next_module;
                    fk = item.fk;
                    name = item.name;
                    logger.debug("[buildRelation][related_model] :", related_model.definition.name);
                    first_model.hasMany(related_model, {foreignKey: fk, as: name});
                    related_model.belongsTo(first_model, {foreignKey: fk});
                    app.relationName = name;
                    RelationInfo[coll_name] = {relationName: name, relatedModel: req.params.related_coll_name};
                    return next();

                  })
                }
              });
              if (!itemfound) return res.status(400).send({"error": "Relation not found"})

            })
        })
      }
    },

    /**
     *
     * @param firstModule
     * @param secondModule
     * @param fk
     * @param name
     * @param next
     */
    setModelRelation: function setModelRelation(firstModule, secondModule, fk, name, next) {
      firstModule.hasMany(secondModule, {foreignKey: fk, as: name});
      secondModule.belongsTo(firstModule, {foreignKey: fk});
      var log = {
        firstmodule: firstModule.definition.name,
        secondmodule: secondModule.definition.name,
        fk: fk,
        name: name
      }
      logger.debug("[setModelRelation]", log);
      return next(true)
    },

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    setReplicaRelation: function setReplicaRelation(req, res, next) {

      logger.debug("[setReplicaRelation][setReplicaRelation app.next_module]:", app.next_module.definition.name);
      app.next_module.hasMany(Replica, {foreignKey: 'collectionId', as: 'replicas'});
      Replica.belongsTo(app.next_module, {foreignKey: 'collectionId'});
      next(true);
    }
  }
}
