/**
 * Created by Antonio Di Mariano on 24/06/15.
 */
var camelize = require('underscore.string');
var loopback = require('loopback');
var async = require('async');
var events = require('events');
var eventEmitter = new events.EventEmitter();


/**
 *
 * @param app
 * @param ds
 * @param data
 *
 *
 */
var getDatasource = function getDatasource(app, ds, data) {
  console.log("[[[EVENT]]] getDatasource");
  if (data.coll_db.host != "" && data.coll_db.location == "remote") {
    console.log("[initCollNameModel][custom remote datasource]");
    CreateDataSource(app, data, function (datasource) {
      // var ds = datasource;
    })
  } else {
    app.CollectionDataSource = ds;
  }
}
/**
 *
 * @param app
 * @param modelName
 * @param next
 * @returns {*}
 */
var findModelInMemory = function findModelInMemory(app, modelName, next) {
  var ModelName = camelize(modelName).trim().capitalize().value();

  if (app.models[ModelName]) {
    console.log("[findModelInMemory][cache app.models", ModelName);
    return next(app.models[ModelName]);
  } else return next();
}

eventEmitter.on('getDatasource', getDatasource);
eventEmitter.on('findModelInMemory', findModelInMemory);
/**


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
  // Datasource di sistema
  var repositoryDB = app.dataSources.repoDB;
  // Modello Repository
  var repository = app.models.Repository;

  return {
    getCollection: function getCollection(req, res, next) {

      var RepoName = camelize(req.params.repo_name).trim().capitalize().value();
      var collectionModule = camelize(req.params.collection_name).trim().capitalize().value();


      /*
       Todo: aggiungere evento
       */
      if (app.models[collectionModule]) {
        console.log("[getCollection][cache app.models]", collectionModule);
        next.module = app.models[collectionModule];
        return next();
      } else {
        var collection_table;
        if (!app.models[RepoName]) {
          console.log('[getCollection][load repo_name Model');
          initRepoNameModel(app, req.params.repo_name, repositoryDB, repository, function (moduleObj) {
            if (moduleObj) {
              var collection_table = moduleObj;
              var fullPath = req.params.repo_name + '/' + req.params.collection_name;

              initCollNameModel(app, fullPath, app.CollectionDataSource, collection_table, function (collectionObj) {
                if (collectionObj) {
                  console.log('[getCollection][load  collection name Model');
                  next.module = collectionObj;
                  return next();
                } else return res.sendStatus(404);
              })
            } else return res.sendStatus(404);
          })
        } else {
          console.log("[getCollection] app.models[RepoName] -----cache-----");
          var collection_table = app.models[RepoName];
          initCollNameModel(app, req.params.repo_name + '/' + req.params.collection_name, app.CollectionDataSource, collection_table, function (collectionObj) {
            if (collectionObj) {
              console.log('[initCollNameModel with RepoName cached CALLBACK to view');
              next.module = collectionObj;
              return next();
            } else return res.sendStatus(404);
          })
        }
      }
    },
    getRepository: function getRepository(req, res, next) {
      var RepoName = camelize(req.params.repo_name).trim().capitalize().value();
      /*
       Todo: aggiungere evento
       */
      if (app.models[RepoName]) {
        console.log("[getRepository][cache app.models]", RepoName);
        next.module = app.models[RepoName];
        return next();
      }
      else {
        //var initRepoNameModel = function (app, path, ds, model, callback) {
        var path = req.params.repo_name;
        var ds = repositoryDB;
        var model = repository;

        initRepoNameModel(app, path, ds, model, function (moduleObj) {
          if (moduleObj) {
            console.log("[getRepository][moduleObj]")
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
    },

    getDatasourceToWrite: function getDatasourceToWrite(req, res, next) {

      /*
       Todo: definire un metodo che verifichi queste condizioni e torni un esito
       */

      if (req.body.coll_db.host != "" && req.body.coll_db.location == "remote") {
        CreateDataSource(app, req.body, function (datasource) {
          return next()
        })
      } else next();

    }

  }

}
/*
 Todo : check dei valori data prima della generazione del datasource.
 I dati devono essere verificati da un middleware a monte
 */
/**
 *
 * @param app
 * @param data
 * @param callback
 * @returns {*}
 * @constructor
 */
var CreateDataSource = function (app, data, callback) {
  var datasource_setup = {

    "host": data.coll_db.host,
    "port": data.coll_db.port,
    "database": data.coll_db.database,
    "username": data.coll_db.username,
    "password": data.coll_db.password,
    "connector": data.coll_db.connector

  }
  console.log("[CreateDataSource]", datasource_setup.host);
  var datasource = loopback.createDataSource(datasource_setup);
  app.CollectionDataSource = datasource;
  return callback(datasource);
}

/**
 * It run createDataSource loopback functionality from data config
 * @param app
 * @param data
 * @param callback
 * @returns {*}
 */
var buildDataSourcefromData = function (app, data, callback) {
  var datasource_setup = {
    "host": data.host,
    "port": data.port,
    "database": data.database,
    "username": data.username,
    "password": data.password,
    "connector": data.connector
  }
  console.log("[buildDataSourcefromData]", datasource_setup.host);
  var datasource = loopback.createDataSource(datasource_setup);
  return callback(datasource)

}
/**
 * Saves datasource entity in memory. By now function saves it to app.CollectionDataSource.
 * In future we could use other stuff to save this kind of information
 *
 * @param app
 * @param datasource
 * @returns {boolean}
 */
var saveDatasourceInMemory = function (app, datasource) {
  if (datasource) {
    app.CollectionDataSource = datasource;
    return true;
  } else return false
}


/**
 *
 * @param app
 * @param path
 * @param ds
 * @param model
 * @param callback
 * @returns {*}
 */
var initRepoNameModel = function (app, path, ds, model, callback) {
  console.log("[initRepoNameModel][PATH]", path);
  if (!ds || !model) {
    console.log("initRepoNameModel FALSE");
    return callback(false);
  }
  model.findOne({
    where: {path: '/' + path}
  }, function (err, data) {
    if (err) return callback(false);
    if (!data) return callback(false);
    else {

      /*
       Todo: definire un metodo che verifichi queste condizioni e torni un esito
       */
      /*
       if (data.coll_db.host != "" && data.coll_db.location == "remote") {
       console.log("[initRepoNameModel][custom datasource]");
       CreateDataSource(app,data,function(callback){
       if(callback) {
       console.log("[initRepoNameModel] Repository "+ path + " has a custom  datasource");
       }
       })
       } else {
       console.log("[initRepoNameModel][DS: datasource.json]");
       app.CollectionDataSource = ds;
       }
       */

      eventEmitter.emit('getDatasource', app, ds, data)

      console.log("[initRepoNameModel] data.coll_db", data.coll_db);

      if (data.repo_db.type != 'mongodb') {
        mapTableToModel(app, ds, data, function (obj) {
          console.log("[initRepoNameModel]mapTableToModel return callback");
          return callback(obj);
        })
      }
      else {
        NoSQLmapTableToModel(app, ds, data, function (obj) {
          console.log("[initRepoNameModel] NoSQLmapTableToModel return callback");
          return callback(obj);
        })
      }
    }
  })
}
/**
 * Validates coll_db data in order to provide a datasource entity for collections
 *
 * @param data
 * @returns {boolean}
 */
var validateCollDBData = function (data) {
  var colldb = data.coll_db;
  if (colldb && colldb.host && colldb.port && colldb.database && colldb.type && colldb.connector && colldb.location) {
    return true;
  } else return false;
}

/**
 * Legge dal repository collections e se trova credenziali per coll_db crea il datasource e lo salva in memoria
 * @param app
 * @param path
 * @param next
 */
var buildDatasourceFromRepository = function (app, path, next) {
  var repository = app.models.Repository;
  repository.findOne({path: path}, function (err, data2) {

    if (validateCollDBData(data2)) {

      buildDataSourcefromData(app, data2.coll_db, function (datasource) {
        if (datasource) {
          console.log("ok salvo datasource in memoria");
          if (saveDatasourceInMemory(app, datasource)) {
            console.log("PROCESSO OK Collection Datasource creato da Repository");
            return next(datasource);
          } {
            console.log("Errore save in memory");
            return next(datasource);
          }
        } else {
          console.log("PROCESSO ERRATO");
          return next(null);
        }
      })
    } else {
      console.log("**********DEFAULT DATASOURCE********");
      var repositoryDB = app.dataSources.repoDB;
      return next(repositoryDB);
    }

  })
}

/**
 * ------------------getCollectionDatasource----------------------------------------------
 * @param app
 * @param collectionData
 * @param req
 * @param next
 */
var getCollectionDatasource = function getCollectionDatasource(app, collectionData, req, callback) {
  console.log("TEST:", req.params.repo_name + '/' + req.params.collection_name);
  buildDatasourceFromRepository(app, req.params.repo_name, function (datasource) {
    if (datasource) {
      console.log("OK TUTTO");
      return callback(datasource);
    } else {
      console.log("SI USA IL DEFAULT ");
      return callback(null);

    }
  })
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
var initCollNameModel = function (app, path, ds, table, callback) {
  console.log("[initCollNameModel] path:", path);
  if (!table) {
    console.log("[initCollNameModel][ERROR][!table]");
    return callback(false);
  }
  table.findOne({
    where: {path: '/' + path}
  }, function (err, data) {
    if (err) return callback(false);
    if (!data) return callback(false);
    else {
      eventEmitter.emit("getDatasource", app, ds, data);
      if (data.coll_db.type != 'mongodb') {
        console.log("[initCollNameModel][!mongodb]", data.coll_db.type);
        mapTableToModel(app, app.CollectionDataSource, data, function (obj) {
          console.log("[initCollNameModel] mapTableToModel return callback");
          return callback(obj);
        })
      }

      if (data.coll_db.type == 'mongodb') {
        console.log("[initCollNameModel] mongodb", data.coll_db.type);
        NoSQLmapTableToModel(app, app.CollectionDataSource, data, function (obj) {
          console.log("[initCollNameModel] NoSQLmapTableToModel return callback");
          return callback(obj);
        })
      }
      if (!data.coll_db.type) {
        console.log("[initCollNameModel][ERRORE][!data.coll_db.type]", data.coll_db.type);
        return callback(null);
      }

      /*async.waterfall(
       [
       // check per datasource remoti diversi da quelli specificati nel repository
       function (callback) {
       // devo importare, cambio datasource
       /!*
       Todo: definire un metodo che verifichi queste condizioni e torni un esito
       *!/
       if (data.coll_db.host != "" && data.coll_db.location == "remote") {
       console.log("[initCollNameModel][custom remote datasource]");
       CreateDataSource(app, data, function (datasource) {
       var ds = datasource;
       callback(ds);
       })
       } else {
       app.CollectionDataSource = ds;
       callback(ds);
       }
       },
       ],
       function (ds) {
       console.log("[initCollNameModel] waterfall end")
       /!*
       Todo: si possono accorpare in  if (data.repo_db.type != 'mongodb') {..}

       *!/
       if (data.coll_db.type == 'mysql') {
       console.log("[initCollNameModel][MySQL]", data.coll_db.type);
       mapTableToModel(app, ds, data, function (obj) {
       console.log("[initCollNameModel][mysql] mapTableToModel return callback");
       return callback(obj);
       })
       }
       if (data.coll_db.type == 'postgresql') {
       console.log("[initCollNameModel][postgreSQL]", data.coll_db.type);
       mapTableToModel(app, ds, data, function (obj) {
       console.log("[initCollNameModel] mapTableToModel return callback");
       return callback(obj);
       })
       }
       if (data.coll_db.type == 'mongodb') {
       console.log("[initCollNameModel] mongodb", data.coll_db.type);
       NoSQLmapTableToModel(app, ds, data, function (obj) {
       console.log("[initCollNameModel] NoSQLmapTableToModel return callback");
       return callback(obj);
       })
       }
       if (!data.coll_db.type) {
       console.log("[initCollNameModel][ERRORE][!data.coll_db.type]", data.coll_db.type);
       return callback(null);
       }
       }
       )*/
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
  console.log("[NoSQLmapTableToModel]");

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

  var $model_path = data.path;
  var $model_name = data.name;
  var $table_name = data.location;
  var owner_id = data.ownerId;
  console.log("[mapTableToModel][table] :", $table_name);
  if (data.coll_db.type == 'mysql') {
    var schema = data.coll_db.database
  }
  if (data.coll_db.type == 'postgresql') {
    var schema = 'public';
  }
  console.log("SCHEMA:", schema);
  datasource.discoverAndBuildModels($table_name,
    {
      schema: schema,
      base: 'PersistedModel',
      name: $model_name,
      plural: $model_path,
      http: {"path": $model_path}
    },
    function (err, models) {
      if (err) callback(err);
      if (models) {

        /*
        console.log("###PROPERTIES",
          app.model(models[camelize($table_name).trim().capitalize().value()]).definition.properties
        );
        */

        app.model(models[camelize($table_name).trim().capitalize().value()])
        console.log('[ModelBuilder][Access new Model at *]: ', $model_path);
        return callback(models[camelize($table_name).trim().capitalize().value()]);

      } else {
        console.log('[ModelBuilder][ERROR building new Model at *]: ', $model_path);
        return callback()
      }
    })
}
