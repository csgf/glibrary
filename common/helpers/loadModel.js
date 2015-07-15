/**
 * Created by hellbreak on 14/07/15.
 */
var camelize = require('underscore.string');
var loopback = require('loopback');
var async = require('async');
var events = require('events');
var eventEmitter = new events.EventEmitter();

var ModelTableMap = {};
/**
 * Effettuata una query sul model e ritorna i records
 * @param app
 * @param path
 * @param model
 * @param callback
 */
var findDataFromModel = function (app, path, model, callback) {

  model.findOne({
    where: {path: '/' + path}
  }, function (err, data) {
    if (err) {
      console.trace()
      console.error(err);
      console.log("model.findOne ERROR");
      return callback(false);
    }
    if (!data) {
      console.log("model.findOne !data ");
      return callback(false);
    }
    else {
      return callback(data)
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
 * Controlla se esistono credenziali per creare un datasource custom e lo ritorna
 * @returns {*|Stream}
 */
var findDatabaseCredentialsFromModel = function (data, callback) {
  if (!validateCollDBData(data)) return callback(false);
  else {
    var db = data.coll_db;
    var datasource_setup = {
      "host": db.host,
      "port": db.port,
      "database": db.database,
      "username": db.username,
      "password": db.password,
      "connector": db.connector
    }
    console.log("[findDatabaseCredentialsFromModel]", datasource_setup.host);
    try {
      var datasource = loopback.createDataSource(datasource_setup);
      return callback(datasource)
    } catch (e) {
      console.log("loopback.createDataSource ERROR");
      //console.error(e);
      //console.trace(e);
    }
  }
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
 * Ritorna il datasource di sistema
 * @param app
 * @param callback
 * @returns {*}
 */
var getSystemDataSource = function (app, callback) {
  var repositoryDB = app.dataSources.repoDB;
  return callback(repositoryDB);
}


var checkTypeOfDB = function(db_type,callback) {
  console.log("CHECK TYPE OF DB",db_type);
  var db_list = {}

  db_list['mysql'] = {type:'mysql'}
  db_list['mongodb'] = {type:'mongodb'}
  db_list['postgresql'] = {type:'postgresql'}

  if (db_type in db_list) {
    console.log("TROVATO",db_list[db_type].type);
    return callback(true)

  } else return callback(false)


}
/**
 * Costruire il Model a partire  da un datasource e da una tabella
 *
 * @param app
 * @param type
 * @param data
 * @param datasource
 * @param callback
 */
var buildModelfromTable = function (app, db_type, db_name, table, modelName, modelPath, datasource, callback) {

  console.log("buildModelFromTable",db_type);

  checkTypeOfDB(db_type,function(value){
    if(!value) {
      return callback(null);
      console.trace();
    } else {

      if (db_type == 'mysql' || db_type == 'postgresql') {

        if (db_type == 'mysql') {
          var schema = db_name;
        }
        if (db_type == 'postgresql') {
          var schema = 'public';
        }

        var relation_options = {

          schema: schema,
          base: 'PersistedModel',
          name: modelName,
          plural: modelPath,
          http: {"path": modelPath}
        }
          buildModelFromRDBMS(app, datasource, table, relation_options, function (model) {
            console.log("[buildModelfromTable][buildModelFromRDBMS] return callback");
            if(model) {
              return callback(model);
            }
            if(!model) {
              return callback(null)
            }
          })
      }
      if (db_type == 'mongodb') {

        buildModelFromNoSQL(app, datasource, table, function (model) {
          console.log("[buildModelfromTable][buildModelFromNoSQL] return callback");
          return callback(model);
        })

      }
    }
  })
}
/**
 * Costruisco il Model a partire da db relazionale
 * @param app
 * @param datasource
 * @param table
 * @param options
 * @param callback
 */
var buildModelFromRDBMS = function (app, datasource, table, options, callback) {
  console.log("TABLE", table);
  datasource.discoverAndBuildModels(table, options,
    function (err, models) {
      if (err) {
        console.trace();
        console.error(err);
        // don't stop after a getaddrinfo ENOTFOUND error;
      }
      if (models) {
        try {
          app.model(models[camelize(table).trim().capitalize().value()])
          console.log('[buildModelFromRDBMS][from path]:', camelize(table).trim().capitalize().value());
          return callback(models[camelize(table).trim().capitalize().value()]);
        } catch (e) {
          // avoid [TypeError: Cannot read property 'prototype' of undefined] error to stop all the stuff
          console.error(e)
          return callback(null);
        }

      } else {
        console.log('[buildModelFromRDBMS][ERROR building]: ', options.http.path);
        return callback(null)
      }
    })
}

/**
 * Costruisco il Model per database NOSQL
 * @param app
 * @param datasource
 * @param table
 * @param callback
 * @returns {*}
 */
var buildModelFromNoSQL = function (app, datasource, table, callback) {

  var json_test = {
    firstname: '',
    lastname: ''
  };
  var runtimeModel = datasource.buildModelFromInstance(table, json_test, {idInjection: true});
  app.model(runtimeModel);
  console.log('[buildModelFromNoSQL]');
  return callback(runtimeModel);
}

var getDataSource = function getDataSource(app, data) {
  console.log("EVENT getDataSource");

  // devo verificare se coll_db contiene credentiali DB e costruisco il datasource
  findDatabaseCredentialsFromModel(data, function (datasource) {
    if (datasource) {
      console.log("datasource custom salvato in app")
      // è stato creato un datasource a partire dalla informazioni del repository
      app.CollectionDataSource = datasource;
    }
    /*
     else {
     getSystemDataSource(app, function (defaultdatasource) {
     console.log("datasource default salvato in app")
     app.CollectionDataSource = defaultdatasource;

     })
     }
     */
  })
}
var buildModel = function buildModel(app, db_type, db_name, db_table, modelName, modelPath, datasource, data) {
  console.log("EVENT builModel");
  buildModelfromTable(app, db_type, db_name, db_table, modelName, modelPath, datasource, function (model) {
    if (model) {
      console.log("model generato");
      app.buildedModel = null;
      app.buildedModel = model;
    }
    if (!model) {
      console.log("model nn generato");
      app.buildedModel = null;
    }
  })

}
var checkCache = function (app, modelName, callaback) {

  if (modelName in ModelTableMap) {
    if (ModelTableMap[modelName].table != modelName) {
      modelName = ModelTableMap[modelName].table
    }
  }

  var ModelName = camelize(modelName).trim().capitalize().value();
  console.log("ModelName", ModelName);
  if (app.models[ModelName]) {
    console.log("[checkCache][cache app.models]", ModelName);
    app.buildedModel = app.models[ModelName];
    //return callback(app.models[RepoName]);

  } else app.buildedModel = null;//return callaback(null);
}

var loadRepository = function (app, req, res, callback) {
  var repositoryDB = app.dataSources.repoDB;
  // Modello Repository
  var repositoryBuiltinModel = app.models.Repository;
  eventEmitter.emit('checkCache', app, req.params.repo_name);
  console.log("ritorno da evento checkCache");
  if (app.buildedModel) {
    callback.module = app.buildedModel;
    return callback(callback.module);
  }
  else {
    findDataFromModel(app, req.params.repo_name, repositoryBuiltinModel, function (repo_data) {
      if (repo_data) {
        eventEmitter.emit('getDataSource', app, repo_data);
        eventEmitter.emit('buildModel', app, 'mongodb', '', repo_data.location, repo_data.name, repo_data.path, repositoryDB);
        console.log("ritorno dagli eventi");
        console.log("--------------------------------------------------------------------------");

        if (app.buildedModel) {
          callback.module = app.buildedModel;
          app.repo_data = repo_data;
          return callback(callback.module);
        }
      } else {
        return callback(null);//res.sendStatus(404);
      }
    })
  }
}


eventEmitter.on('getDataSource', getDataSource);
eventEmitter.on('buildModel', buildModel);
eventEmitter.on('checkCache', checkCache);
eventEmitter.on('checkdb',checkTypeOfDB)

module.exports = function (app) {

  return {

    getRepository: function getRepository(req, res, next) {
      loadRepository(app, req, res, function (cb) {
        if (cb) {
          next.module = cb;
          return next()
        } else return res.sendStatus(404);
      })
    },
    getCollection: function getCollection(req, res, next) {

      console.log("***********************************************************************");


      eventEmitter.emit('checkCache', app, req.params.collection_name);
      if (app.buildedModel) {
        console.log("TROVATA CACHE GETCOLLECTION");
        next.module = app.buildedModel;
        return next();
      }

      else {
        loadRepository(app, req, res, function (repoModel) {
          if (repoModel) {
            var requestURL = req.params.repo_name + '/' + req.params.collection_name;
            findDataFromModel(app, requestURL, repoModel, function (coll_data) {
              if (coll_data) {
                eventEmitter.emit('getDataSource', app, coll_data);

                if (coll_data.coll_db.type != '') var db_type = coll_data.coll_db.type;
                else var db_type = app.repo_data.coll_db.type;

                if (app.repo_data.coll_db.database) var db_name = app.repo_data.coll_db.database
                if (coll_data.coll_db.database) var db_name = coll_data.coll_db.database;
                buildModelfromTable(app, db_type, db_name, coll_data.location, coll_data.name, coll_data.path, app.CollectionDataSource, function (model) {
                  if (model) {
                    console.log("OK.....");
                    ModelTableMap[req.params.collection_name] = {table: coll_data.location};

                    next.module = model;
                    return next()
                  } else return res.sendStatus(404);

                })
              } else {
                return res.sendStatus(404);

              }
            })
          } else return res.sendStatus(404);
        })
      }
    },
    removeModel: function removeModel(req, res, next) {


      eventEmitter.emit('checkCache', app, req.params.pathToDelete);
      if (app.buildedModel) {
        console.log("TROVATA CACHE pathToDelete");
        app.buildedModel = null;
        return next();
      } else return next();

    },

  }
}
