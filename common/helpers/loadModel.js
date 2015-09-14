/**
 * Created by Antonio Di Mariano on 14/07/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
var camelize = require('underscore.string');
var loopback = require('loopback');
var events = require('events');
var eventEmitter = new events.EventEmitter();

var ModelTableMap = {};
var RepoDataSource = {};

var logger = require("./logger");

var RoleMapper = require('./rolemapping');


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
      logger.debug("model.findOne ERROR");
      return callback(false);
    }
    if (!data) {
      logger.debug("model.findOne !data");
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
    logger.debug("[findDatabaseCredentialsFromModel]", datasource_setup.host);
    try {
      var datasource = loopback.createDataSource(datasource_setup);
      return callback(datasource)
    } catch (e) {
      logger.debug("loopback.createDataSource ERROR");
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
var setSystemDataSource = function(app) {
  app.CollectionDataSource = app.dataSources.repoDB;
  return true;
}


var checkTypeOfDB = function(db_type,callback) {
  logger.debug("CHECK TYPE OF DB",db_type);
  var db_list = {}

  db_list['mysql'] = {type:'mysql'}
  db_list['mongodb'] = {type:'mongodb'}
  db_list['postgresql'] = {type:'postgresql'}

  if (db_type in db_list) {
    logger.debug("TROVATO",db_list[db_type].type);
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

  logger.debug("----------[buildModelFromTable]-------------")
  logger.debug("\nDB_TYPE:",db_type,"\nTABLE: ",table,"\nmodelName: ",modelName);
  logger.debug("--------------------------------------------")

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
            logger.debug("[buildModelfromTable][buildModelFromRDBMS] return callback : ", modelName);
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
          logger.debug("[buildModelfromTable][buildModelFromNoSQL] return callback");
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
  logger.debug("[buildModelFromRDBMS][table]", table,options);
  datasource.discoverAndBuildModels(table, options,
    function (err, models) {
      if (err) {
        console.trace();
        console.error(err);
        console.log("ERR",err.code)
        if(err.code == 'ER_ACCESS_DENIED_ERROR') {
          callback.code_error = 412;
          return callback(null);
        }
        // don't stop after a getaddrinfo ENOTFOUND error;
      }
      if (models) {
        try {
          logger.debug('[buildModelFromRDBMS][Model]:', camelize(options.name).trim().capitalize().value());
          app.model(models[camelize(options.name).trim().capitalize().value()])
          return callback(models[camelize(options.name).trim().capitalize().value()]);
        } catch (e) {
          // avoid [TypeError: Cannot read property 'prototype' of undefined] error to stop all the stuff
          logger.error("[buildModelFromRDBMS][catch error]");
          console.error(e)
          return callback(null);
        }

      } else {
        logger.debug('[buildModelFromRDBMS][ERROR building]: ', options.http.path);

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
  try {
    var runtimeModel = datasource.buildModelFromInstance(table, json_test, {idInjection: true});
    app.model(runtimeModel);
    logger.debug('[buildModelFromNoSQL]');
    return callback(runtimeModel);

  }catch(er) {
    console.trace()
    console.error(er);
    return callback(null);
  }
  }

var getDataSource = function getDataSource(app, data) {

  // devo verificare se coll_db contiene credentiali DB e costruisco il datasource
  findDatabaseCredentialsFromModel(data, function (datasource) {
    if (datasource) {
      logger.debug("[getDataSource] datasource custom salvato in app")
      // è stato creato un datasource a partire dalla informazioni del repository
      app.CollectionDataSource = datasource;
    } else {
      logger.debug("[getDataSource] Using Repository's Datasource")
      app.CollectionDataSource = app.repo_ds;
    }
  })
}
var buildModel = function buildModel(app, db_type, db_name, db_table, modelName, modelPath, datasource, data) {
  logger.debug("-------------[buildModel]--------------");
  buildModelfromTable(app, db_type, db_name, db_table, modelName, modelPath, datasource, function (model) {
    if (model) {
      logger.debug("[buildModel][model generato]",modelName);
      app.buildedModel = null;
      app.buildedModel = model;

      /*
      var role = new RoleMapper(app);
      var data = {
         principalId_value : 4,
         principalType_value : 'repositoryOwner',
         userId: 2
      }

      role.assignRoleToModel(data,function(cb){
        logger.debug("Ritorno da assignRoleToModel",cb);
      })
      */

    }
    if (!model) {
      logger.debug("[buildModel] model NON generato");
      app.buildedModel = null;
    }
  })

}
var checkCache = function (app, modelName, callaback) {

  logger.debug("------------[checkCache]----------------");

  if (modelName in ModelTableMap) {
    logger.debug("-*-[checkCache][ModelName is in ModelTableMap]", ModelTableMap[modelName])
    if (ModelTableMap[modelName].table != modelName) {
      logger.debug("-*-[checkCache]ModelTableMap[modelName].table != modelName ")
      modelName = ModelTableMap[modelName].table
    }
  }

  var ModelName = camelize(modelName).trim().capitalize().value();

  if (app.models[ModelName]) {
    logger.debug("--[checkCache][found in cache] app.model[",ModelName+"]");

    if(modelName in RepoDataSource) {
      app.CollectionDataSource = RepoDataSource[modelName].datasource;
      logger.debug("-*-[checkCache][app.CollectionDataSource = RepoDataSource[modelName].datasource]")
    }

    app.buildedModel = app.models[ModelName];
    //return callback(app.models[RepoName]);

  } else app.buildedModel = null;//return callaback(null);
}
/**
 *
 * @param app
 * @param req
 * @param res
 * @param callback
 * @returns {*}
 */
var loadRepository = function (app, req, res, callback) {

  var repositoryDB = app.dataSources.repoDB;

  // Modello Repository
  var repositoryBuiltinModel = app.models.Repository;
  eventEmitter.emit('checkCache', app, req.params.repo_name);


 // logger.debug("CONTROLLO REPO_DATA",app.repo_data);

  if (app.buildedModel) {
    callback.module = app.buildedModel;
    app.repositoryModel = callback.module;

    return callback(callback.module);
  }
  else {
    findDataFromModel(app, req.params.repo_name, repositoryBuiltinModel, function (repo_data) {
      if (repo_data) {

        if(!repo_data.coll_db || repo_data.coll_db.host == ''){
          logger.debug("[loadRepository] Load system datasources");
          app.CollectionDataSource = app.dataSources.repoDB;

        } else {
          eventEmitter.emit('getDataSource', app, repo_data);
        }

        eventEmitter.emit('buildModel', app, 'mongodb', '', repo_data.location, repo_data.name, repo_data.path, repositoryDB);
        callback.module = app.buildedModel;
        app.repo_data = repo_data;
        console.log("REPO DATA:",app.repo_data);

       // usato nel getDataSource
        app.repo_ds = app.CollectionDataSource;

        RepoDataSource[req.params.repo_name] = {datasource: app.CollectionDataSource};
        logger.debug("*[loadRepository][app.repo_data = repo_data]");
        logger.debug("*[loadRepository][app.repo_ds = app.CollectionDataSource]");
        logger.debug("*[loadRepository][RepoDataSource[req.params.repo_name] = {datasource: app.CollectionDataSource};]");
        logger.debug("*[loadRepository][return callback]");

        app.repositoryModel = callback.module;
        return callback(callback.module);

      } else {
        return callback(null);//res.sendStatus(404);
      }
    })
  }
}

/**
 *
 * @param app
 * @param coll_data
 * @returns {string|string|string}
 */
var setDB_type = function(app,coll_data) {

  if (coll_data.coll_db && coll_data.coll_db.type != '')
    var db_type = coll_data.coll_db.type;
  else
    var db_type = 'mongodb';

  return db_type;
}
/**
 *
 * @param app
 * @param coll_data
 * @returns {string|string|string|string|string|string|*}
 */
var setDB_name = function(app,coll_data) {


  console.log("REPO",app.repo_data);
  if(!app.repo_data.coll_db) {
    var db_name =   'repository';
    console.log("QUI");
  }
  if (app.repo_data.coll_db && app.repo_data.coll_db.database != '')
    var db_name = app.repo_data.coll_db.database
  if (coll_data.coll_db.database)
    var db_name = coll_data.coll_db.database;
  return db_name;
}
/**
 *
 * @param app
 * @param req_params
 * @returns {*}
 */
var setModelName = function(app,req_params) {
  var repoNameTMP = camelize(req_params.repo_name).trim().capitalize().value();
  var collNameTMP = camelize(req_params.collection_name).trim().capitalize().value();

  var modelName = repoNameTMP+collNameTMP
  return modelName;

}
/**
 *
 * @param app
 * @param req_params
 * @returns {string}
 */
var setModelTable = function(app,req_params) {
  var modelTable = req_params.repo_name+"_"+req_params.collection_name;
  return modelTable;
}
/**
 *
 * @param app
 * @param model
 * @param next
 */
var setReplicaRelation = function(app,model,next) {
  var relation = require("./modelRelation");
  var rl = new relation(app);
  var Replica = app.models.Replica;

  //set hasMany Replicas
  rl.setModelRelation(model,Replica,'collectionId','replicas',function(cb){
    // TODO: check cb value before return next()
    return next(cb)

  });

}

/**
 *
 * @param req
 * @param res
 * @param next
 */
var setupParameters = function(req,res,next) {
  // POST su /v1/repos
  var location = (!req.body.location ? req.body.name.trim() : req.body.location.trim());
  var coll_db = (!req.body.coll_db ? null : req.body.coll_db);

  if(!req.params.repo_name) {
    var path = (!req.body.path ?  '/'+req.body.name.trim() :  req.body.path.trim());
  }
  //POST su /v1/repo/:repo_name
  if(req.params.repo_name) {
    var path = (!req.body.path ? '/'+req.params.repo_name+'/'+req.body.name.trim() : req.body.path.trim());
    var import_flag = (!req.body.import ? "false" : req.body.import);
    var schema = (!req.body.schema ? null : req.body.schema);
  }

  if(import_flag) {
    parameters = {
      "name":req.body.name,
      "path": path,
      "location":location,
      "coll_db" : coll_db,
      "import": import_flag,
      "schema":schema
    }
  } else {
    parameters = {
      "name":req.body.name,
      "path": path,
      "location":location,
      "coll_db" : coll_db,
    }

  }
  logger.debug("[setupParameters][parameters]:",parameters);
  next(parameters);
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
          //app.repositoryModel =cb;
          logger.debug("------------end of getRepository---------------")
          return next()
        } else return res.sendStatus(404);
      })
    },
    getCollection: function getCollection(req, res, next) {
      console.log("COLLECTION:------------->",req.params.collection_name);
      logger.debug("-------------- START [getCOLLECTION] -----------------");
      var modelName = setModelName(app,req.params);

      eventEmitter.emit('checkCache', app, modelName);
      if (app.buildedModel) {
        logger.debug("[checkCache][Model Loaded From Cache]");
        next.module = app.buildedModel;
        return next();
      }

      else {
        logger.debug("--------------[getCOLLECTION] loadRepository---------------");
        loadRepository(app, req, res, function (repoModel) {
          if (repoModel) {
            var requestURL = req.params.repo_name + '/' + req.params.collection_name;
            console.log("REQUEST URL", requestURL);
            findDataFromModel(app, requestURL, repoModel, function (coll_data) {
              if (coll_data) {
                if(!coll_data.coll_db || coll_data.coll_db == null ) {
                  app.CollectionDataSource = app.dataSources.repoDB;
                  var db_type = 'mongodb';
                  var db_name = app.dataSources.repoDB.database;

                } else {
                  eventEmitter.emit('getDataSource', app, coll_data);
                  var db_type = setDB_type(app,coll_data);
                  var db_name = setDB_name(app,coll_data);

                }

                if (coll_data.import == "true" ) {
                  logger.debug("[getCOLLECTION] IMPORT DATA==TRUE");
                  var modelTable = coll_data.location;
                  var modelName = modelTable;

                } else {
                  var modelTable = setModelTable(app,req.params);
                  var modelName = setModelName(app,req.params);

                }
                logger.debug("[getCOLLECTION][modelTable]",modelTable);
                //al posto di modelName ci stava coll_data.name
                buildModelfromTable(app, db_type, db_name, modelTable, modelName, coll_data.path,
                  app.CollectionDataSource, function (model) {
                  if (model) {
                    logger.debug("[getCollection][buildModelfromTable][OK]");
                    if(coll_data.import == "true") {
                      var modelName = setModelName(app,req.params);
                      ModelTableMap[modelName] = {table: modelTable};
                      logger.stream.write("[getCollection]ModelTableMap["+modelName+"]={table:"+modelTable+"}")
                      logger.debug("[getCollection]ModelTableMap["+modelName+"]={table:"+modelTable+"}");

                    }
                    next.module = model;
                    app.next_module = model;
                    // sets relation btw Collection Model and Replica Model
                    setReplicaRelation(app,model,function(callback){
                      if(callback) {
                        return next();
                      }
                    })
                    //return next();

                   } else {
                    return res.sendStatus(404);
                  }

                })
              } else {
                return res.sendStatus(404);

              }
            })
          } else return res.sendStatus(404);
        })
      }
    },


    getDatasourceToWrite: function getDatasourceToWrite(req, res, next) {

      setupParameters(req,res,function(json_body){
        logger.debug("[getDatasourceToWrite][json_body]",json_body);
        next.body = json_body;
        if(!next.body.coll_db) {
          app.CollectionDataSource = app.dataSources.repoDB;
        } else {
          eventEmitter.emit('getDataSource', app, req.body);
        }
        next();
      })
    },
    removeModel: function removeModel(req, res, next) {


      eventEmitter.emit('checkCache', app,  req.params.pathToDelete);
      if (app.buildedModel) {
        logger.debug("TROVATA CACHE pathToDelete");
        app.buildedModel = null;
        return next();
      } else {
        console.log("NON CANCELLATO MODELLO IN MEMORIA", req.params.pathToDelete);
        app.buildedModel = null;
        return next();
      }

    },

    buildpayload: function buildpayload(req,res,next) {
      setupParameters(req,res,function(json_body){
        logger.debug("[json_body]",json_body);
        next.body = json_body;
        next();
      })

    }

  }
}

