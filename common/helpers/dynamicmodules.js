/**
 * Created by hellbreak on 24/06/15.
 */
var camelize = require('underscore.string');

module.exports = function tmpModel(app) {
  var repositoryDB = app.dataSources.repoDB;
  var repository = app.models.Repository;


  return {


    getCollection : function getCollection(req,res,next) {

      var moduleName = camelize(req.params.repo_name).trim().capitalize().value();
      var collectionModule = camelize(req.params.collection_name).trim().capitalize().value();
      if(app.models[collectionModule]) {
        console.log("[getCollection][cache app.models]",collectionModule);
        next.module = app.models[collectionModule];
        return next();
      } else {
        var collection_table;
        if(!app.models[moduleName]) {
          console.log('CARICO');

          getmodel(app, req.params.repo_name, repositoryDB, repository, function (moduleObj) {
            if (moduleObj) {
              var collection_table = moduleObj;
              getmodel(app, req.params.repo_name+'/'+ req.params.collection_name, repositoryDB, collection_table, function (collectionObj) {
                if (collectionObj) {
                  console.log('ok carico');
                  next.module = collectionObj;
                  return next();
                } else return res.sendStatus(404);
              })
            }
          })
        } else {
          console.log("cache");
          var collection_table = app.models[moduleName];
          getmodel(app, req.params.repo_name+'/'+ req.params.collection_name, repositoryDB, collection_table, function (collectionObj) {
            if (collectionObj) {
              console.log('ok cache');
              next.module = collectionObj;
              return next();
            } else return res.sendStatus(404);
          })
        }

      }
    },
    getRepository : function getRepository(req,res,next) {
      var moduleName = camelize(req.params.repo_name).trim().capitalize().value();



      if(app.models[moduleName]) {
        console.log("[getRepository][cache app.models",moduleName);
        next.module = app.models[moduleName];
        return next();
      }
      else {
        getmodel(app,req.params.repo_name,repositoryDB,repository,function(moduleObj){
          if(moduleObj) {
            next.module = moduleObj;
            return next();

          } else return res.sendStatus(404);
        })
      }
    },

    removeModel : function removeModel(req,res,next) {

      var moduleName = camelize(req.params.repo_name).trim().capitalize().value();
      if(app.models[moduleName]) {
        console.log("[getRepository][cache app.models",moduleName);
        app.models[moduleName] = null;
        return next();

      }
    }

  }

}
/**
 *
 * @param app
 * @param path
 * @param ds
 * @param table
 * @param callback
 * @returns {*}
 */
var getmodel = function(app,path,ds,table,callback)
{
  console.log("GETMODEL");
  if(!ds || !table) {
    console.log("FALSE");
    return callback(false);
  }

  table.findOne({
    where: { path : '/'+path}
  },function(err,data){
    if(err) return callback(false);
    if(!data) return callback(false);
    mapTableToModel(app,ds,data,function(obj){
      console.log("getModel return callback");
      return callback(obj);
    })
  })
}
/**
 *
 * @param app
 * @param datasource
 * @param data
 * @param callback
 */
var mapTableToModel =  function (app,datasource,data, callback)
{
  //console.log("[mapTableToModel][data] :",data);

  var $model_path = data.path;
  var $model_name = data.name;
  var $table_name = data.location;
  var owner_id = data.ownerId;
  console.log("[mapTableToModel][data] :",$table_name);
  datasource.discoverAndBuildModels($table_name,
    {
      schema: 'public',
      base: 'PersistedModel',
      name: $model_name,
      plural: $model_path,
      http: {"path": $model_path}
    },
    function (er, models) {
      if (er) callback(err);
      app.model(models[camelize($table_name).trim().capitalize().value()]);

      /*
       for (var m in models) {
       console.log("MODELLO",m);
       var model = models[m];
       model.setup();
       app.model(model);
       }
       */
      console.log('[ModelBuilder][Access new Model at *]: ', $model_path);
      callback(models[camelize($table_name).trim().capitalize().value()]);
    })
}
