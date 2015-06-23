/**
 * Created by hellbreak on 23/06/15.
 */
var camelize = require('underscore.string');
var app = require('../../server/server.js');
var repositoryDB = app.dataSources.repoDB;
var repository = app.models.Repository;


exports.isAdmin = function isAdmin(req, res, next) {
  console.log("load module");
  return res.send('ciao');


}

var getmodel = function(app,path,ds,table,callback) {
  console.log("GETMODEL");
  if (!ds || !table) {
    console.log("FALSE");
    return callback(false);
  }

  table.findOne({
    where: {path: '/' + path}
  }, function (err, data) {
    if (err) return callback(false);
    if (!data) return callback(false);
    mapTableToModel(app, ds, data, function (obj) {
      console.log("getModel return callback");
      return callback(obj);
    })
  })
}
exports.getCollection = function getCollection(req,res,next) {

  var moduleName = camelize(req.params.collection_name).trim().capitalize().value();
  if(app.models[moduleName]) {
    next.module = app.models[moduleName];
    next();
  } else {
    var collectionModule = camelize(req.params.collection_name).trim().capitalize().value();
    if(!app.models[collectionModule]) {
      getmodel(app, req.params.repo_name, repositoryDB, repository, function (moduleObj) {
        if (moduleObj) {
          getmodel(app, req.params.repo_name+'/'+ req.params.collection_name, repositoryDB, moduleObj, function (collectionObj) {
            if (collectionObj) {
              next.module = collectionObj;
              next();
            } else return res.sendStatus(401);
          })
        } else return res.sendStatus(404);
      })
    }
  }
}
exports.getRepository = function getRepository(req,res,next) {
  var moduleName = camelize(req.params.repo_name).trim().capitalize().value();


  if(app.models[moduleName]) {
   next.module = app.models[moduleName];
    next();
  }
  else {
    getmodel(app,req.params.repo_name,repositoryDB,repository,function(moduleObj){
      if(moduleObj) {
        next.module = moduleObj;
        next();

      } else return res.sendStatus(404);
    })
  }
}



exports.setModule = function setModule(datasource,data, callback) {
  console.log("DATA:",data);
/*
  mapTableToModel(datasource,data,function(cb){
    if(cb) return callback(true);
    else return callback(false);
  })
*/

}
module.exports.loadModule = function() {
 console.log("load module");
  return true;
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
module.exports.getmodel = function(app,path,ds,table,callback)
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
  console.log("[mapTableToModel][data] :",data);

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
      for (var m in models) {
        var model = models[m];
        model.setup();
        app.model(model);
      }
      console.log('[ModelBuilder][Access new Model at *]: ', $model_path);
      callback(model);
    })
}
