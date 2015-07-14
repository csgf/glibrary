/**
 * Created by hellbreak on 14/07/15.
 */
var camelize = require('underscore.string');
var loopback = require('loopback');
var async = require('async');
var events = require('events');
var eventEmitter = new events.EventEmitter();


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
    if (err)   return callback(false);
    if (!data) return callback(false);
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
    var datasource = loopback.createDataSource(datasource_setup);
    return callback(datasource)
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

/**
 * Costruire il Model a partire  da un datasource e da una tabella
 *
 * @param app
 * @param type
 * @param data
 * @param datasource
 * @param callback
 */
var buildModelfromTable = function (app, db_type, db_name, table, datasource, callback) {

  console.log("buildModelFromTable");

  if (db_type != 'mongodb') {

    if (db_type == 'mysql') {
      var schema = db_name;
    }
    if (db_type == 'postgresql') {
      var schema = 'public';
    }

    var relation_options = {

      schema: schema,
      base: 'PersistedModel',
      name: data.name,
      plural: data.path,
      http: {"path": data.path}
    }

    buildModelFromRDBMS(app, datasource, table, relation_options, function (model) {
      console.log("[initRepoNameModel]mapTableToModel return callback");
      return callback(model);
    })
  }
  else {
    buildModelFromNoSQL(app, datasource, table, function (model) {
      console.log("[initRepoNameModel] NoSQLmapTableToModel return callback");
      return callback(model);
    })
  }
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

  datasource.discoverAndBuildModels(table, options,
    function (err, models) {
      if (err) callback(err);
      if (models) {
        app.model(models[camelize(table).trim().capitalize().value()])
        console.log('[buildModelFromRDBMS][from path]:', options.path);
        return callback(models[camelize(table).trim().capitalize().value()]);
      } else {
        console.log('[buildModelFromRDBMS][ERROR building]: ', options.path);
        return callback()
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
    } else {
      getSystemDataSource(app, function (defaultdatasource) {
        console.log("datasource default salvato in app")
        app.CollectionDataSource = defaultdatasource;

      })
    }
  })
}
var buildModel = function buildModel(app, db_type, db_name, db_table, datasource, data) {
  console.log("EVENT builModel");
  buildModelfromTable(app, db_type, db_name, db_table, datasource, function (model) {
    if (model) {
      console.log("model generato");
      app.buildedModel = model;
    }
    if (!model) {
      console.log("model nn generato");
      app.buildedModel = null;
    }
  })

}
var checkCache = function (app, modelName, callaback) {
  var ModelName = camelize(modelName).trim().capitalize().value();

  if (app.models[ModelName]) {
    console.log("[checkCache][cache app.models", ModelName);
    app.buildedModel = app.models[ModelName];
    //return callback(app.models[RepoName]);

  } else app.buildedModel = null;//return callaback(null);
}

eventEmitter.on('getDataSource', getDataSource);
eventEmitter.on('buildModel', buildModel);
eventEmitter.on('checkCache', checkCache);

module.exports = function (app) {
  var repositoryDB = app.dataSources.repoDB;
  // Modello Repository
  var repositoryBuiltinModel = app.models.Repository;

  return {

    getRepository: function getRepository(req, res, next) {

      eventEmitter.emit('checkCache', app, req.params.repo_name);
      console.log("ritorno da evento checkCache");
      if (app.buildedModel) {
        next.module = app.buildedModel;
        return next();
      }
      else {
        findDataFromModel(app, req.params.repo_name, repositoryBuiltinModel, function (repo_data) {
          if (repo_data) {
            eventEmitter.emit('getDataSource', app, repo_data);
            eventEmitter.emit('buildModel', app, 'mongodb', '', repo_data.location, repositoryDB);
            console.log("ritorno dagli eventi");
            console.log("--------------------------------------------------------------------------");

            if (app.buildedModel) {
              next.module = app.buildedModel;
              return next();
            }
          } else {
            return res.sendStatus(404);
          }
        })
      }
    }
  }
}

