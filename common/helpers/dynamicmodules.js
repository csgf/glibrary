/**
 * Created by hellbreak on 24/06/15.
 */
var camelize = require('underscore.string');
var loopback = require('loopback');


var dati_repo_name = {

  "name": "deroberto",
  "path": "/deroberto",

  "repoDb": {
    "host": "null | ip",
    "port": "",
    "type": "mysql|postgresql|mongodb",
    "location": "local|remote",
    "tableToMap": "deroberto",
    "import": "true|false"
  },

  "coll_db": {
    "host:": "...",
    "port": "",
    "dbtype": "mysql|postgresql|mongodb",
    "location": "local|remote",
  }
}

var dati_coll_name = {

  "name": "opere",
  "path": "/deroberto/opere",
  "coll_db": {
    "location": "local|remote",
    "type": "mysql|postgresl|mongodb",
    "host": "",
    "port": "",
    "username": "",
    "password": "",
    "tableToMap": "opere",
    "import": "true|false"
  }

}
/*

 Get repo_name
 leggo da DB locale la entry corrispondente al path richiesto in GET es /deroberto
 Se repoDb.location == "local", allora le informazioni del datasource restano quelle di sistema
 Se repoDb.location == "remote", la tabella viene importanta/creata in un database remoto
 repoDb.host e gli altri campi contengo le credenziali di accesso al db
 Il datasource di riferimento deve essere aggiornato e rigerato a partire dai nuovi dati.
 (Non si usa quello di sistema specificato in datasources.json)
 Si procede analizzando il repoDb.type per indirizzare al metodo Relazionale o ad Istanza(NO-SQL) per il Building del Model relativo alla tabella
 repoDb.tableToMap.
 La callback ritorna il app.model del Model creato. Su questo si esegue la query richiesta es find(req.query.filter,function(err,dati))

 Get repo_name/coll_name


 in fase di parsing di dati_coll_name

 se location == "local", il datasource è quello di sistema oppure quello specificato in repoDb.host se collDb.location=="remote"

 se location == "remote" il datasource viene rigeranto a partire dalle informazioni in dati_coll_name.coll_db.host

 quindi quando esegueo la GET per la collection_name devo avere a disposizione i dati relativi al repository.

 Questi dati possono essere o in cache , app.model.Verga, oppure caricati attraverso la getModel.
 Si deve applicare una query su app.model.Verga? oppure provare a stampare il valore  della property importata durante la costruzione
 del modello, sia esso Relazionale che Non Relazionale



 ld.geRepository deve


 1. leggere dal db locale e trovare la entry richiesta
 2. se le operazioni sono locali, procedere
 3. il model è creato e salvato in app.model

 1. se le operazioni sono remote si deve generare il datasource con le credenziali del db remoto e passarlo al metodo , Relaziona le o No,
 per il building.


 ld.getCollection

 controlla se la app.model.RepoName esiste in cache


 legge dal db le info per la collection
 se è locale  controlla se il repo_mame ha credenziali per un datasource diverso da quewllo locale. In caso crea il dataousce,
 o lo riprende da app.model o da quache sessione.
 Se invece la collection ha una location == remote, allora il datasouece viene generato a partire da questi dati


 il datasource effettua il building.
 il datasouc equindi è salvato in cache in app.model
 dal building esce un model che viene aggangiato a app.model e sul quale si effettuano le query.

 */


module.exports = function tmpModel(app) {
  var repositoryDB = app.dataSources.repoDB;
  var repository = app.models.Repository;
  return {
    getCollection: function getCollection(req, res, next) {

      var RepoName = camelize(req.params.repo_name).trim().capitalize().value();
      var collectionModule = camelize(req.params.collection_name).trim().capitalize().value();

      if (app.models[collectionModule]) {
        console.log("[getCollection][cache app.models]", collectionModule);
        next.module = app.models[collectionModule];
        return next();
      } else {
        var collection_table;
        if (!app.models[RepoName]) {
          console.log('CARICO repo_name');
          initRepoNameModel(app,req.params.repo_name, repositoryDB, repository, function (moduleObj) {
            if(moduleObj) {
              var collection_table = moduleObj;
                  var fullPath = req.params.repo_name + '/' + req.params.collection_name;

                  initCollNameModel(app,fullPath,app.CollectionDataSource,collection_table,function(collectionObj){
                    if (collectionObj) {
                      console.log('carico collection name');
                      next.module = collectionObj;
                      return next();
                    } else return res.sendStatus(404);
                  })
            } else return res.sendStatus(404);
          })
        } else {
          console.log("app.models[RepoName] -----cache-----");
          var collection_table = app.models[RepoName];

          initCollNameModel(app, req.params.repo_name + '/' + req.params.collection_name, app.CollectionDataSource, collection_table, function (collectionObj) {
            if (collectionObj) {
              console.log('ok cache');
              next.module = collectionObj;
              return next();
            } else return res.sendStatus(404);
          })
        }
      }
    },
    getRepository: function getRepository(req, res, next) {
      var RepoName = camelize(req.params.repo_name).trim().capitalize().value();

      if (app.models[RepoName]) {
        console.log("[getRepository][cache app.models", RepoName);
        next.module = app.models[RepoName];
        return next();
      }
      else {
        initRepoNameModel(app, req.params.repo_name, repositoryDB, repository, function (moduleObj) {
          if (moduleObj) {
            console.log("moduleObj", moduleObj);
            next.module = moduleObj;
            return next();

          } else return res.sendStatus(404);
        })
      }
    },

    removeModel: function removeModel(req, res, next) {
      var RepoName = camelize(req.params.repo_name).trim().capitalize().value();
      if (app.models[RepoName]) {
        console.log("[getRepository][cache app.models", RepoName);
        app.models[RepoName] = null;
        return next();
      } else return next();
    }
  }

}
var CreateDataSource = function(app,data,callback) {
  console.log("Default Collections DB configuration");
  var datasource_setup = {

    "host": data.coll_db.host,
    "port": data.coll_db.port,
    "database" : data.coll_db.database,
    "username" : data.coll_db.username,
    "password" : data.coll_db.password,
    "connector" : data.coll_db.connector

  }
  var datasource = loopback.createDataSource(datasource_setup);
  app.CollectionDataSource = datasource;
  return callback(datasource);
}
/*
var CreateCustomDatasource = function(app,path,ds,table,callback) {
  console.log("getDefaultCollectionDBInfoFromRepository", path);
  if (!ds || !table) {
    console.log("getDefaultCollectionDBInfoFromRepository FALSE");
    return callback(false);
  }
  table.findOne({
    where: {path: '/' + path}
  }, function (err, data) {
    if (err) return callback(false);
    if (!data) return callback(false);
    else {
      if(data.coll_db.location == "remote") {
        console.log("Default Collections DB configuration");
        var datasource_setup = {

          "host": data.coll_db.host,
          "port": data.coll_db.port,
          "database" : data.coll_db.database,
          "username" : data.coll_db.username,
          "password" : data.coll_db.password,
          "connector" : data.coll_db.connector

        }
        var datasource = loopback.createDataSource(datasource_setup);
        app.CollectionDataSource = datasource;
        return callback(datasource);
      } else {
        console.log("No Default Collection DB configuration");
        return callback(ds);
      }

    }
  })
}
*/

var initRepoNameModel = function (app, path, ds, table, callback) {
  console.log("initRepoNameModel", path);
  if (!ds || !table) {
    console.log("initRepoNameModel FALSE");
    return callback(false);
  }
  table.findOne({
    where: {path: '/' + path}
  }, function (err, data) {
    if (err) return callback(false);
    if (!data) return callback(false);
    else {
      if(data.coll_db.location == "remote") {
        console.log("initRepoNameModel Default Collections DB configuration");
        CreateDataSource(app,data,function(datasource){
          var ds = datasource;
        });
        /*var datasource_setup = {

          "host": data.coll_db.host,
          "port": data.coll_db.port,
          "database": data.coll_db.database,
          "username": data.coll_db.username,
          "password": data.coll_db.password,
          "connector": data.coll_db.connector

        }
        var datasource = loopback.createDataSource(datasource_setup);
        app.CollectionDataSource = datasource;
        */
      }

      if (data.repo_db.type != 'mongodb') {
        mapTableToModel(app, ds, data, function (obj) {
          console.log("mapTableToModel return callback");
          return callback(obj);
        })
      }
      else {
        NoSQLmapTableToModel(app, ds, data, function (obj) {
          console.log("NoSQLmapTableToModel return callback");
          return callback(obj);
        })
      }
    }
  })
}

var initCollNameModel = function(app,path,ds,table,callback) {
  console.log("initCollNameModel", path);
  if (!ds || !table) {
    console.log("initCollNameModel FALSE");
    return callback(false);
  }
  table.findOne({
    where: {path: '/' + path}
  }, function (err, data) {
    if (err) return callback(false);
    if (!data) return callback(false);
    else {
      if(data.import == true) {
        if(data.coll_db.host != "" && data.coll_db.location == "remote") {
          console.log("-----------location remote datasouce custom---------");
          CreateDataSource(app,data,function(datasource){
            var ds = datasource;
          })
        }
      }
      if(data.coll_db.type == 'mysql') {
        mapTableToModel(app, ds, data, function (obj) {
          console.log("mapTableToModel return callback");
          return callback(obj);
        })
      }
      if(data.coll_db.type == 'postgresql') {
        NoSQLmapTableToModel(app, ds, data, function (obj) {
          console.log("NoSQLmapTableToModel return callback");
          return callback(obj);
        })
      }
      if(data.coll_db.type == 'mongodb') {
        NoSQLmapTableToModel(app, ds, data, function (obj) {
          console.log("NoSQLmapTableToModel return callback");
          return callback(obj);
        })
      }
    }
  })
}

/** ONLY FOR NOSQL Database
 * @param app
 * @param datasource
 * @param data
 * @param callback
 * @returns {*}
 */
var NoSQLmapTableToModel = function (app, datasource, data, callback) {
  console.log("[NoSQLmapTableToModel][data] :");

  var $model_path = data.path;
  var $table_name = data.location;

  // defailt json schema
  //!!!! definire questo punto. Per importare un modello da mongodb, buildModelFromInstance necessita di uno schema json su cui mappare
  var json_test = {
    name: 'Joe',
  };
  var runtimeModel = datasource.buildModelFromInstance($table_name, json_test, {idInjection: true});
  app.model(runtimeModel);
  console.log('[NoSQLmapTableToModel][Access new Model at *]: ', $model_path);
  return callback(runtimeModel);

}
/** ONLY for Relational Database
 *
 * @param app
 * @param datasource
 * @param data
 * @param callback
 */

var mapTableToModel = function (app, datasource, data, callback) {
  console.log("[mapTableToModel][data] :");

  var $model_path = data.path;
  var $model_name = data.name;
  var $table_name = data.location;
  var owner_id = data.ownerId;
  console.log("[mapTableToModel][data] :", $table_name);

//  var schema = 'public';
  var schema = 'dboe_test_daily';
//var schema = data.coll_db.database;
  datasource.discoverAndBuildModels($table_name,
    {
      schema: schema,
      base: 'PersistedModel',
      name: $model_name,
      plural: $model_path,
      http: {"path": $model_path}
    },
    function (er, models) {
      if (er) callback(err);
      if (models) {
        app.model(models[camelize($table_name).trim().capitalize().value()]);
        console.log('[ModelBuilder][Access new Model at *]: ', $model_path);
        callback(models[camelize($table_name).trim().capitalize().value()]);

      } else callback()
    })
}

