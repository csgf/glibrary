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
            } else return res.sendStatus(404);
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
            console.log("moduleObj",moduleObj);
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
      } else return next();
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
  console.log("GETMODEL", path);
  if(!ds || !table) {
    console.log("FALSE");
    return callback(false);
  }

  table.findOne({
    where: { path : '/'+path}
  },function(err,data){
    if(err) return callback(false);
    if(!data) return callback(false);
    NoSQLmapTableToModel(app,ds,data,function(obj){
      console.log("getModel return callback");
      return callback(obj);
    })
  })
}
/** ONLY FOR NOSQL Database
 * @param app
 * @param datasource
 * @param data
 * @param callback
 * @returns {*}
 */
var NoSQLmapTableToModel = function (app,datasource,data,callback )
{
  console.log("[NoSQLmapTableToModel][data] :",data);

  var $model_path = data.path;
  var $table_name = data.location;

  // defailt json schema
  var json_test = {
    name: 'Joe',
    age: 30,
    birthday: new Date()

  };
  /* DA ABILITARE
  if (data.storage == 'remote') {
    console.log("STORAGE REMOTO");
    var remoteDBsetup = {
      "host" : data.host,
      "port" : data.port,
      "database" : data.database,
      "username" : data.username,
      "password" : data.password,
      "connector" : data.connector
    }
    var datasource = loopback.createDataSource(remoteDBsetup);
  }
  */
  // building Model from json_test schema
  var runtimeModel = datasource.buildModelFromInstance($table_name, json_test, {idInjection: true});
  //
  app.model(runtimeModel);
  console.log('[NoSQLmapTableToModel][Access new Model at *]: ', $model_path);
  return callback( runtimeModel );



}
/** ONLY for Relational Database
 *
 * @param app
 * @param datasource
 * @param data
 * @param callback
 */

/*var mapTableToModel =  function (app,datasource,data, callback)
{
  console.log("[mapTableToModel][data] :",data);
  var loopback = require('loopback');

  var $model_path = data.path;
  var $model_name = data.name;
  var $table_name = data.location;
  var owner_id = data.ownerId;
  console.log("[mapTableToModel][data] :",$table_name);
  // inserire un ulteriore controllo per identificare che stiamo processando dati relativi a una collections


  if (data.storage == 'remote') {
    console.log("STORAGE REMOTO");
    var remoteDBsetup = {
      "host" : data.host,
      "port" : data.port,
      "database" : data.database,
      "username" : data.username,
      "password" : data.password,
      "connector" : data.connector
    }

    var datasource = loopback.createDataSource(remoteDBsetup);
    /!*if (data.connector == 'mongodb') {

    }*!/
  }
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
      if(models) {
        app.model(models[camelize($table_name).trim().capitalize().value()]);
/!*
        app.model(models[camelize($table_name).trim().capitalize().value()]).find(function(err,records){
          if(err) throw err;
             console.log('Records:',records);
        })
*!/
        /!*
         for (var m in models) {
         console.log("MODELLO",m);
         var model = models[m];
         model.setup();
         app.model(model);
         }
         *!/
        console.log('[ModelBuilder][Access new Model at *]: ', $model_path);
        callback(models[camelize($table_name).trim().capitalize().value()]);

      } else callback()
    })
}*/

