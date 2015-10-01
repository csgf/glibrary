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


var validatereqbodyname = function (body, next) {
  if (body && body.name) {
    var qry = body.name;
    if (qry.match(/[^a-z\d]+/i)) {
      next(false);
    } else next(true);

  } else next(false)

}

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
  //&& colldb.connector && colldb.location
  if (colldb && colldb.host && colldb.port && colldb.database && colldb.type) {
    return true;
  } else return false;
}

/**
 * Controlla se esistono credenziali per creare un datasource custom e lo ritorna
 * @returns {*|Stream}
 */
var findDatabaseCredentialsFromModel = function (data, callback) {

  //logger.debug("[findDatabaseCredentialsFromModel][data]",data);
  if (!validateCollDBData(data)) {
    logger.error("[findDatabaseCredentialsFromModel][callback FALSE]");

    return callback(false);
  }
  else {
    var db = data.coll_db;

    var datasource_setup = {
      "host": db.host,
      "port": db.port,
      "database": db.database,
      "username": db.username,
      "password": db.password,
      "connector": db.type
    }
    try {
      var datasource = loopback.createDataSource(datasource_setup);
      return callback(datasource)
    } catch (e) {
      logger.debug("loopback.createDataSource ERROR");
      console.error(e);
      console.trace(e);
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
var setSystemDataSource = function (app) {
  app.CollectionDataSource = app.dataSources.repoDB;
  return true;
}


var checkTypeOfDB = function (db_type, callback) {
  //logger.debug("CHECK TYPE OF DB",db_type);
  var db_list = {}

  db_list['mysql'] = {type: 'mysql'}
  db_list['mongodb'] = {type: 'mongodb'}
  db_list['postgresql'] = {type: 'postgresql'}

  if (db_type in db_list) {
    //logger.debug("TROVATO",db_list[db_type].type);
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

  //logger.debug("----------[buildModelFromTable]-------------")
  //logger.debug("\nDB_TYPE:",db_type,"\nTABLE: ",table,"\nmodelName: ",modelName);
  //logger.debug("--------------------------------------------")

  checkTypeOfDB(db_type, function (value) {
    if (!value) {
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
          //logger.debug("[buildModelfromTable][buildModelFromRDBMS] return callback : ", modelName);
          if (model) {
            return callback(model);
          }
          if (!model) {
            return callback(null)
          }
        })
      }
      if (db_type == 'mongodb') {

        buildModelFromNoSQL(app, datasource, table, function (model) {
          //logger.debug("[buildModelfromTable][buildModelFromNoSQL] return callback");
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
  logger.debug("[buildModelFromRDBMS][table] = ", table);

  // logger.debug("[buildModelFromRDBMS][table]", table,options);
  datasource.discoverAndBuildModels(table, options,
    function (err, models) {
      if (err) {
        console.trace();
        console.error(err);
        console.log("ERR", err.code)
        if (err.code == 'ER_ACCESS_DENIED_ERROR') {
          callback.code_error = 412;
          return callback(null);
        }
        // don't stop after a getaddrinfo ENOTFOUND error;
      }
      if (models) {
        console.log("***[MODEL NAME]: ", Object.keys(models)[0]
        )

        try {
          logger.debug('[buildModelFromRDBMS][Model]:', camelize(options.name).trim().capitalize().value());

          //var nome = "FragebogenAutor"
          var nome = Object.keys(models)[0];
          var modello = app.model(models[nome]);
          return callback(modello)

          //app.model(models[camelize(options.name).trim().capitalize().value()])
          //return callback(models[camelize(options.name).trim().capitalize().value()]);
        } catch (e) {
          // avoid [TypeError: Cannot read property 'prototype' of undefined] error to stop all the stuff
          logger.error("[buildModelFromRDBMS][catch error]");
          console.error(e)
          return callback(null);
        }

      } else {
        logger.error('[buildModelFromRDBMS][ERROR building]: ', options.http.path);

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

  } catch (er) {
    console.trace()
    console.error(er);
    return callback(null);
  }
}

var getDataSource = function getDataSource(app, data) {

  // devo verificare se coll_db contiene credentiali DB e costruisco il datasource
  //logger.debug("[getDataSource][data]",data);
  // if data are valid a datasource will be return
  findDatabaseCredentialsFromModel(data, function (datasource) {
    if (datasource) {
      // è stato creato un datasource a partire dalla informazioni del repository
      // updates app.CollectionDataSource that will be used to persist collection model
      app.CollectionDataSource = datasource;
      logger.debug("[getDataSource][app.CollectionDataSource]=", app.CollectionDataSource.settings.host +
        " DB =", app.CollectionDataSource.settings.database);
    }
    if (!datasource) {
      //  logger.debug("[getDataSource] datasource callback FALSE")

      /* Todo: capire cosa fare nel caso in cui i dati di coll_db non passino la validazione*/
      // somethings went wrong. Let's use the system default mongodb

      app.CollectionDataSource = RepoDataSource[req.params.repo_name].datasource;
      logger.debug("[getDataSource][app.CollectionDataSource]=", app.CollectionDataSource.settings.host +
        " DB =", app.CollectionDataSource.settings.database);

    }

  })
}


var buildModel = function buildModel(app, db_type, db_name, db_table, modelName, modelPath, datasource, data) {
  logger.debug("-------------[buildModel]--------------");
  // builds model according to datasources
  buildModelfromTable(app, db_type, db_name, db_table, modelName, modelPath, datasource, function (model) {

    if (model) {
      logger.debug("[buildModel][Created Model]:", modelName);
      app.buildedModel = null; // reset
      app.buildedModel = model; //

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
      logger.error("[buildModel] model NON generato");
      app.buildedModel = null;
    }
  })

}
var checkCache = function (app, modelName, callaback) {

  //logger.debug("------------[checkCache]----------------");

  if (modelName in ModelTableMap) {
    logger.debug("-*-[checkCache][ModelName is in ModelTableMap]", ModelTableMap[modelName])
    if (ModelTableMap[modelName].table != modelName) {
      logger.debug("-*-[checkCache]ModelTableMap[modelName].table != modelName ")
      modelName = ModelTableMap[modelName].table
    }
  }
  // transforms modelname in ModelName as required by loopback
  var ModelName = camelize(modelName).trim().capitalize().value();
  // checks if the model required is ready
  if (app.models[ModelName]) {
    logger.debug("--[checkCache][found in cache] app.model[", ModelName + "]");

    if (modelName in RepoDataSource) {
      app.CollectionDataSource = RepoDataSource[modelName].datasource;
      logger.debug("--[checkCache][app.CollectionDataSource] =", RepoDataSource[modelName].datasource.settings.host)
    }
    //store the Model in app.buildedModel that will be check by getRepository
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

  // stores che mongodb system datasources
  var repositoryDB = app.dataSources.repoDB;

  //  Repository Model
  var repositoryBuiltinModel = app.models.Repository;

  /*
   checks if the model required is in the system's cache
   the event returns
   app.buildedModel = app.models[ModelName] or app.buildedModel = null
   */
  eventEmitter.emit('checkCache', app, req.params.repo_name);


  // logger.debug("CONTROLLO REPO_DATA",app.repo_data);
  // checks if Model is ready in the system's cache
  if (app.buildedModel) {
    // assigns the Model obj to callback.module that will be use in rest-api to run query on the Model required
    callback.module = app.buildedModel;
    // !-----!
    app.repositoryModel = callback.module;
    // returns in case the function is invoked not as middleware
    return callback(callback.module);
  }
  else {
    // searchs for /req.params.repo_name path in the mongodb repository collection
    findDataFromModel(app, req.params.repo_name, repositoryBuiltinModel, function (repo_data) {
      logger.debug("[repositoryBuiltinModel]:", repositoryBuiltinModel.definition.name);

      if (repo_data) { // query result of the repo_name Model we have just loaded

        // we have found the path required. Checks if it has an external datasource
        if (!repo_data.coll_db || repo_data.coll_db.host == '') {
          // uses system default mongodb to store collection_model
          logger.debug("[loadRepository] Load system datasources");
          app.CollectionDataSource = repositoryDB;

        } else {
          // we have to use a custom datasource
          logger.debug("[loadRepository] custom datasource in repo");

          // runs the event to build a datasource from data stored in the repo_name Model
          /*
           After getDataSource we will have
           if(datasource)
           app.CollectionDataSource = datasource;

           if(!datasource)
           app.CollectionDataSource = app.repo_ds

           app.CollectionDataSource will be used to persit collection model
           if it has the app.repo_ds we will store collection in the system's mongodb

           */
          eventEmitter.emit('getDataSource', app, repo_data);
        }
        // builds model using system mongodb
        // buildModel function sets app.buildedModel = model
        eventEmitter.emit('buildModel', app, 'mongodb', '', repo_data.location, repo_data.name, repo_data.path, repositoryDB); // <-- to be checked

        callback.module = app.buildedModel; //
        app.repo_data = repo_data; // store repo data ?

        // usato nel getDataSource
        // salvo il app.CollectionDataSource specificato nel repository. potrebbe essere quello di sistema o uno custom
        // getDataSource viene chiamato anche da getCollection : se la collection non presenta un campo coll_db, allora deve essere


        // usato il datasource specificato nel repository. Capire se può essere recuperato dal modello del repository
        // eliminato perchè memorizziamo nella HT RepoDataSource
        //app.repo_ds = app.CollectionDataSource;

        // store in a HashTable the repo_name datasource
        RepoDataSource[req.params.repo_name] = {datasource: app.CollectionDataSource};


        //logger.debug("*[loadRepository][app.repo_data = repo_data]");
        //logger.debug("*[loadRepository][app.repo_ds = app.CollectionDataSource]");
        //logger.debug("*[loadRepository][RepoDataSource[req.params.repo_name] = {datasource: app.CollectionDataSource};]");
        //logger.debug("*[loadRepository][return callback]");

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
var setDB_type = function (app, coll_data) {
//  console.log("SETDBTYPE:",coll_data);

  if (coll_data.coll_db && coll_data.coll_db.type != '') {

    var db_type = coll_data.coll_db.type;
  }
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
var setDB_name = function (app, coll_data) {


//  console.log("REPO",app.repo_data);
  if (!app.repo_data.coll_db) {
    var db_name = 'repository';
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
var setModelName = function (app, req_params) {
  var repoNameTMP = camelize(req_params.repo_name).trim().capitalize().value();
  var collNameTMP = camelize(req_params.collection_name).trim().capitalize().value();

  var modelName = repoNameTMP + collNameTMP
  return modelName;

}
/**
 *
 * @param app
 * @param req_params
 * @returns {string}
 */
var setModelTable = function (app, req_params) {
  var modelTable = req_params.repo_name + "_" + req_params.collection_name;
  return modelTable;
}
/**
 *
 * @param app
 * @param model
 * @param next
 */
var setReplicaRelation = function (app, model, next) {
  var relation = require("./modelRelation");
  var rl = new relation(app);
  var Replica = app.models.Replica;

  //set hasMany Replicas
  rl.setModelRelation(model, Replica, 'collectionId', 'replicas', function (cb) {
    logger.debug("[setReplicaRelation][", model.definition.name + " hasMany Replica]");
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
var setupParameters = function (req, res, next) {

  validatereqbodyname(req.body, function (cb) {

    if (!cb) return res.status(400).send({error: "Invalid request"})

    // POST su /v1/repos
    var location = (!req.body.location ? req.body.name.trim() : req.body.location.trim()).toLowerCase();
    var coll_db = (!req.body.coll_db ? null : req.body.coll_db);

    if (!req.params.repo_name) {
      var path = (!req.body.path ? '/' + req.body.name.trim() : req.body.path.trim()).toLowerCase();
    }
    //POST su /v1/repo/:repo_name
    if (req.params.repo_name) {
      var path = (!req.body.path ? '/' + req.params.repo_name + '/' + req.body.name.trim() : req.body.path.trim()).toLowerCase();
      var import_flag = (!req.body.import ? "false" : req.body.import);
      var schema = (!req.body.schema ? null : req.body.schema);
    }
    var name = req.body.name.toLowerCase();
    if (import_flag) {
      parameters = {
        "name": name,
        "path": path,
        "location": location,
        "coll_db": coll_db,
        "import": import_flag,
        "schema": schema
      }
    } else {
      parameters = {
        "name": name,
        "path": path,
        "location": location,
        "coll_db": coll_db,
      }
    }
    logger.debug("[setupParameters][parameters]:", parameters);
    next(parameters);
  })
}

/**
 * Chechs for relationship's name into collection's json
 *
 * @param collection
 * @param field
 * @param value
 * @returns {boolean}
 */
var findrelatedCollection = function (collection, field, value) {
  var _ = require("underscore");
  var filtered = _.where(collection, {relatedCollection: value});
  if (filtered.length > 0) return true;
  else return false;
};
/* ----------------------------------------------------------- module exports -----------------------------------------------*/

eventEmitter.on('getDataSource', getDataSource);
eventEmitter.on('buildModel', buildModel);
eventEmitter.on('checkCache', checkCache);
eventEmitter.on('checkdb', checkTypeOfDB)

module.exports = function (app) {

  return {

    getRepository: function getRepository(req, res, next) {
      loadRepository(app, req, res, function (cb) {
        if (cb) {
          next.module = cb;
          logger.debug("[getRepository][next.module]= ", cb.definition.name);
          logger.debug("------------end of getRepository---------------")
          return next();
        } else return res.sendStatus(404);
      })
    },
    getCollection: function getCollection(req, res, next) {
      //console.log("COLLECTION:------------->",req.params.collection_name);
      logger.debug("-------------- START [getCOLLECTION] -----------------");
      var modelName = setModelName(app, req.params);

      eventEmitter.emit('checkCache', app, modelName);
      if (app.buildedModel) {
        logger.debug("[getCollection][Model Loaded From Cache]=", app.buildedModel.definition.name);
        next.module = app.buildedModel;
        app.next_module = next.module;
        logger.debug("[getCollection][app.CollectionDataSource]=", app.CollectionDataSource.settings.host +
          " DB =", app.CollectionDataSource.settings.database);

        return next();
      }

      else {
        logger.debug("--------------[getCOLLECTION] loadRepository---------------");
        loadRepository(app, req, res, function (repoModel) {
          if (repoModel) {
            var requestURL = req.params.repo_name + '/' + req.params.collection_name;
            //console.log("REQUEST URL", requestURL);
            // searchs for the collection_name requested path in repoModel
            findDataFromModel(app, requestURL, repoModel, function (coll_data) {
              if (coll_data) {
                // we have the info about collection_name. Check if we have a custom datasource to build
                if (!coll_data.coll_db || coll_data.coll_db == null) {
                  //logger.debug("[getCollection][app.CollectionDataSource]=",RepoDataSource[req.params.repo_name].datasource.settings.host +
                  //" DB =",RepoDataSource[req.params.repo_name].datasource.settings.database);

                  app.CollectionDataSource = RepoDataSource[req.params.repo_name].datasource;
                  var db_type = RepoDataSource[req.params.repo_name].datasource.settings.connector;
                  var db_name = RepoDataSource[req.params.repo_name].datasource.settings.database;


//                  app.CollectionDataSource = app.dataSources.repoDB;
//                  var db_type = 'mongodb';
//                  var db_name = app.dataSources.repoDB.database;

                } else {
                  eventEmitter.emit('getDataSource', app, coll_data);
                  var db_type = setDB_type(app, coll_data);
                  var db_name = setDB_name(app, coll_data);
                }

                if (coll_data.import == "true") {
                  logger.debug("-------[getCollection][Import Data]----------");
                  var modelTable = coll_data.location;
                  var modelName = modelTable;

                } else {
                  var modelTable = setModelTable(app, req.params);
                  var modelName = setModelName(app, req.params);

                }
                logger.debug("[getCollection][app.CollectionDataSource]=", app.CollectionDataSource.settings.host +
                  " DB =", app.CollectionDataSource.settings.database);
                logger.debug("[getCollection][modelTable]", modelTable);
                logger.debug("[getCollection][db_type]", db_type);
                logger.debug("[getCollection][db_name]", modelName);

                //al posto di modelName ci stava coll_data.name
                buildModelfromTable(app, db_type, db_name, modelTable, modelName, coll_data.path,
                  app.CollectionDataSource, function (model) {
                    if (model) {
                      logger.debug("[getCollection][buildModelfromTable][OK]");
                      if (coll_data.import == "true") {
                        var modelName = setModelName(app, req.params);
                        ModelTableMap[modelName] = {table: modelTable};
                        logger.stream.write("[getCollection]ModelTableMap[" + modelName + "]={table:" + modelTable + "}")
                        logger.debug("[getCollection]ModelTableMap[" + modelName + "]={table:" + modelTable + "}");
                      }
                      app.CollectionModelTable = modelTable;
                      console.log("app.CollectionModelTable = modelName", app.CollectionModelTable)
                      next.module = model;
                      app.next_module = model;
                      // sets relation btw Collection Model and Replica Model
                      setReplicaRelation(app, model, function (callback) {
                        if (callback) {
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
      setupParameters(req, res, function (json_body) {
        next.body = json_body;
        if (!next.body.coll_db) {
          logger.debug("[getDatasourceToWrite][Nothing to do]");
          next();
        } else {
          eventEmitter.emit('getDataSource', app, req.body);
          logger.debug("[getDatasourceToWrite][app.CollectionDataSource]=", app.CollectionDataSource.settings.host +
            " DB =", app.CollectionDataSource.settings.database);

          next();
        }
      })
    },
    /*

     This FIX the id auto incement issue.




     */
    createPersistedModel: function createModel(req, res, next) {

      if (app.CollectionDataSource.settings.connector != 'mongodb') {
        var datasource = loopback.createDataSource(app.CollectionDataSource.settings);
        console.log("datasource:", datasource.settings, app.CollectionModelTable);

        datasource.discoverSchema(app.CollectionModelTable, {}, function (err, schema) {
          console.log("schema", schema);
          if (err) throw err;
          delete schema.properties.id;
          var collmodel = datasource.createModel(app.CollectionModelTable, schema.properties);
          next.persistedModel = collmodel;
          next()
        })

      } else {
        logger.debug("[createPersistedModel][mongodb]");

        next.persistedModel = next.module;
        next()
      }


    },

    removeModel: function removeModel(req, res, next) {


      eventEmitter.emit('checkCache', app, req.params.pathToDelete);
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

    buildpayload: function buildpayload(req, res, next) {
      setupParameters(req, res, function (json_body) {
        logger.debug("[buildpayload][saved body in next.body]");
        next.body = json_body;
        next();
      })

    },


    validatebody: function validatebody(req, res, next) {
      console.log("VALIDATE");
      validatereqbodyname(req.body, function (cb) {
        if (cb) next()
        else return res.status(400).send({error: "Invalid request"})
      })
    },

    validateRelationBody: function validateRelationBody(req, res, next) {

      console.log("validate Relation", req.body);
      if (!req.body.relatedCollection || !req.body.fk)
        return res.status(400).send({error: "Invalid request"})
      var relation_name = (!req.body.name ? req.body.relatedCollection : req.body.name).toLowerCase();
      var relationbody = {
        "relatedCollection": req.body.relatedCollection.toLowerCase(),
        "fk": req.body.fk,
        "name": relation_name

      }
      next.relationbody = relationbody
      next();
    },

    checkduplicate: function checkduplicate(json, relationbody, next) {
      if (json.length == 0) return next();
      if (findrelatedCollection(json, 'relatedCollection', relationbody.relatedCollection)) {
          return next(true)
      } else return next(false);
    }
  }
}

