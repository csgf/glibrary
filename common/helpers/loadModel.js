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


/**
 *
 * @param body
 * @param next
 */
var validatereqbodyname = function (body, next) {

  if (body && body.name) {
    var qry = body.name;
    var regx = /^[a-z\d]+[a-z\d_]*[a-z\d]$/;

    if (regx.test(qry)) {
      next(true);
    } else next(false);
  } else next(false)

}

/**
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
      logger.error("[findDataFromModel][model.findOne] ERROR", err);
      return callback(false);
    }
    if (!data) {
      logger.debug("[findDataFromModel][model.findOne !data]");
      return callback(false);
    }
    else {
      return callback(data)
    }
  })
}

/**
 *
 * @param data
 * @returns {boolean}
 */
var validateCollDBData = function (data) {
  var colldb = data.collection_db;
  if (colldb && colldb.host && colldb.port && colldb.database && colldb.type) {
    return true;
  } else return false;
}

/**
 *
 * @param data
 * @param callback
 * @returns {*}
 */
var findDatabaseCredentialsFromModel = function (data, callback) {

  if (!validateCollDBData(data)) {
    logger.error("[findDatabaseCredentialsFromModel][callback FALSE]");

    return callback(false);
  }
  else {
    var db = data.collection_db;

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
 * @param app
 * @param callback
 * @returns {*}
 */
var getSystemDataSource = function (app, callback) {
  var repositoryDB = app.dataSources.repoDB;
  return callback(repositoryDB);
}
/**
 *
 * @param app
 * @returns {boolean}
 */
var setSystemDataSource = function (app) {
  app.CollectionDataSource = app.dataSources.repoDB;
  return true;
}

/**
 *
 * @param db_type
 * @param callback
 * @returns {*}
 */
var checkTypeOfDB = function (db_type, callback) {
  var db_list = {}

  db_list['mysql'] = {type: 'mysql'}
  db_list['mongodb'] = {type: 'mongodb'}
  db_list['postgresql'] = {type: 'postgresql'}

  if (db_type in db_list) {
    return callback(true)
  } else return callback(false)
}

/**
 * It Builds Model from datasource and tablename
 * @param app
 * @param type
 * @param data
 * @param datasource
 * @param callback
 */
var buildModelfromTable = function (app, db_type, db_name, table, modelName, modelPath, datasource, callback) {

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
          if (model) {
            return callback(model);
          }
          if (!model) {
            return callback(null)
          }
        })
      }
    }
  })
}
/**
 * It builds model from RDBMS db
 * @param app
 * @param datasource
 * @param table
 * @param options
 * @param callback
 */
var buildModelFromRDBMS = function (app, datasource, table, options, callback) {

  datasource.discoverAndBuildModels(table, options,
    function (err, models) {
      if (err) {
        console.trace();
        console.error(err);
        logger.error("[discoverAndBuildModels][Error]", err.code)
        if (err.code == 'ER_ACCESS_DENIED_ERROR') {
          callback.code_error = 412;
          return callback(null);
        }
        // don't stop after a getaddrinfo ENOTFOUND error;
      }
      if (models) {


        try {
          logger.debug('[buildModelFromRDBMS][Model]:', camelize(options.name).trim().capitalize().value());
          var name = Object.keys(models)[0];
          var model = app.model(models[name]);
          return callback(model)

        } catch (e) {
          // avoid [TypeError: Cannot read property 'prototype' of undefined] error to stop all the stuff
          logger.error("[buildModelFromRDBMS][catch error]");
          logger.error(e)
          return callback(null);
        }

      } else {
        logger.error('[buildModelFromRDBMS][ERROR building]: ', options.http.path);
        return callback(null)
      }
    })
}

/**
 * It builds Model from NOSQL db
 * @param app
 * @param datasource
 * @param table
 * @param callback
 * @returns {*}
 */
var buildModelFromNoSQL = function (app, datasource, table, callback) {

  // just a default payload. Optional
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
/**
 * It verifies if collection_db has db credentials
 * @param app
 * @param data
 */
var getDataSource = function getDataSource(app, data) {

  // It verifies if collection_db has db credentials
  findDatabaseCredentialsFromModel(data, function (datasource) {
    if (datasource) {
      app.CollectionDataSource = datasource;
      logger.debug("[getDataSource][app.CollectionDataSource]=", app.CollectionDataSource.settings.host +
        " DB =", app.CollectionDataSource.settings.database);
    }
    if (!datasource) {
      // somethings went wrong. Let's use the system default mongodb
      app.CollectionDataSource = RepoDataSource[req.params.repo_name].datasource;
      logger.debug("[getDataSource][app.CollectionDataSource]=", app.CollectionDataSource.settings.host +
        " DB =", app.CollectionDataSource.settings.database);
    }
  })
}

/**
 * It builds model from db tablename
 * @param app
 * @param db_type
 * @param db_name
 * @param db_table
 * @param modelName
 * @param modelPath
 * @param datasource
 * @param data
 */
var buildModel = function buildModel(app, db_type, db_name, db_table, modelName, modelPath, datasource, data) {
  buildModelfromTable(app, db_type, db_name, db_table, modelName, modelPath, datasource, function (model) {

    if (model) {
      logger.debug("[buildModel][Created Model]:", modelName);
      app.buildedModel = null; // reset
      app.buildedModel = model; //
    }
    if (!model) {
      logger.error("[buildModel] model NON generato");
      app.buildedModel = null;
    }
  })

}
/**
 * it checks if model ha been stored in memory
 * @param app
 * @param modelName
 * @param callaback
 */
var checkCache = function (app, modelName, callaback) {

  /*
    it checks if modelName has been stored in ModelTableMap during the buildCollection process.
    If modelName is stored in ModelTableMap, we have to check if the tablename value is different from modelName one.
    tablename value could be different from modelName when we have imported a collection
   */

  if (modelName in ModelTableMap) {
    logger.debug("-*-[checkCache][ModelName is in ModelTableMap]", ModelTableMap[modelName])
    if (ModelTableMap[modelName].table != modelName) {
      logger.debug("-*-[checkCache]ModelTableMap[modelName].table != modelName ")
      modelName = ModelTableMap[modelName].table
    }
  }
  var ModelName = camelize(modelName).trim().capitalize().value();  // transforms modelname in ModelName as required by loopback

  logger.debug("[checkCache][ModelName]",ModelName);

  // checks if the model required is ready
  if (app.models[ModelName]) {
    logger.debug("--[checkCache][found in cache] app.model[", ModelName + "]");

    if (modelName in RepoDataSource) {
      app.CollectionDataSource = RepoDataSource[modelName].datasource;
      logger.debug("--[checkCache][app.CollectionDataSource] =", RepoDataSource[modelName].datasource.settings.host)
    }
    app.buildedModel = app.models[ModelName]; //store the Model in app.buildedModel that will be check by buildRepositoryModel
    //app.ModelName = ModelName;
  } else app.buildedModel = null;
}

/**
 * It builds repository model
 * @param app
 * @param req
 * @param res
 * @param callback
 * @returns {*}
 */
var loadRepository = function (app, req, res, callback) {


  var repositoryDB = app.dataSources.repoDB;// stores che mongodb system datasources
  var repositoryBuiltinModel = app.models.Repository;

  /*
   checks if model is in the system's cache
   the event returns
   app.buildedModel = app.models[ModelName] or app.buildedModel = null
   */
  eventEmitter.emit('checkCache', app, req.params.repo_name);
  // checks if Model is ready in the system's cache
  if (app.buildedModel) {
    // assigns the Model obj to callback.module that will be use in rest-api to run query on the Model required
    logger.debug("[checkCache][app.buildedModel]: ", app.buildedModel.definition.name)
    callback.module = app.buildedModel;
    app.repositoryModel = app.buildedModel;
    // returns in case the function is invoked not as middleware
    return callback(callback.module);
  }
  else {
    // searchs for /req.params.repo_name path in the mongodb repository collection
    findDataFromModel(app, req.params.repo_name, repositoryBuiltinModel, function (repo_data) {
      logger.debug("[repositoryBuiltinModel]:", repositoryBuiltinModel.definition.name);

      if (repo_data) { // query result of the repo_name Model we have just loaded

        // we have found the path required. Checks if it has an external datasource
        if (!repo_data.collection_db || repo_data.collection_db.host == '') {
          // uses system default mongodb to store collection_model
          logger.debug("[loadRepository] Load system datasources");
          app.CollectionDataSource = repositoryDB;

        } else {
          // we have to use a custom datasource
          logger.debug("[loadRepository] custom datasource in repo");
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
        /*
        /*
         builds model using system mongodb
         buildModel function sets app.buildedModel = model
         */
        eventEmitter.emit('buildModel', app, 'mongodb', '', repo_data.tablename, repo_data.name, repo_data.path, repositoryDB); // <-- to be checked

        callback.module = app.buildedModel;
        app.repo_data = repo_data; // store repo data
        // store in a HashTable the repo_name datasource
        RepoDataSource[req.params.repo_name] = {datasource: app.CollectionDataSource};
        app.repositoryModel = callback.module;
        return callback(callback.module);
      } else {
        return callback(null);
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

  if (coll_data.collection_db && coll_data.collection_db.type != '') {
    var db_type = coll_data.collection_db.type;
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

  if (!app.repo_data.collection_db) {
    var db_name = 'repository';
  }
  if (app.repo_data.collection_db && app.repo_data.collection_db.database != '')
    var db_name = app.repo_data.collection_db.database
  if (coll_data.collection_db.database)
    var db_name = coll_data.collection_db.database;
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
  var modelTable = req_params.repo_name + "+" + req_params.collection_name;
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
  var _relation = new relation(app);
  var Replica = app.models.Replica;

  //set hasMany Replicas
  _relation.setModelRelation(model, Replica, 'collectionId', 'replicas', function (cb) {
    logger.debug("[setReplicaRelation][", model.definition.name + " hasMany Replica]");
    if (cb)
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
    if (!cb) {
      if (!res)  next(false);
      else
        return res.status(400).send({error: "Invalid request"})
    }

    // POST su /v1/repos
    var tablename = (!req.body.tablename ? req.body.name.trim() : req.body.tablename.trim());
    var collection_db = (!req.body.collection_db ? null : req.body.collection_db);
    var default_storage = (!req.body.default_storage ? null : req.body.default_storage);

    var path = (!req.body.path ? '/' + req.body.name.trim() : req.body.path.trim()).toLowerCase();
    //POST su /v1/repo/:repo_name
    if (req.params && req.params.repo_name) {
      var path = (!req.body.path ? '/' + req.params.repo_name + '/' + req.body.name.trim() : req.body.path.trim()).toLowerCase();
      var import_flag = (!req.body.import ? "false" : req.body.import);
      var schema = (!req.body.schema ? null : req.body.schema);
    }
    var name = req.body.name.toLowerCase();
    if (import_flag) {
      parameters = {
        "name": name,
        "path": path,
        "tablename": tablename,
        "collection_db": collection_db,
        "default_storage":default_storage,
        "import": import_flag,
        "schema": schema
      }
    } else {
      parameters = {
        "name": name,
        "path": path,
        "tablename": tablename,
        "collection_db": collection_db,
        "default_storage":default_storage
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

    buildRepositoryModel: function buildRepositoryModel(req, res, next) {
      loadRepository(app, req, res, function (cb) {
        if (cb) {
          next.module = cb;
          logger.debug("[buildRepositoryModel][next.module]= ", cb.definition.name);
          logger.debug("------------end of buildRepositoryModel---------------")
          return next(cb);
        } else {
          return next(false);
        }
      })
    },
    buildCollectionModel: function buildCollectionModel(req, res, next) {
      logger.debug("-------------- START [getCOLLECTION] -----------------");
      var modelName = setModelName(app, req.params);

      eventEmitter.emit('checkCache', app, modelName);
      if (app.buildedModel) {
        logger.debug("[buildCollectionModel][Model Loaded From Cache]=", app.buildedModel.definition.name);
        next.module = app.buildedModel;//here for compatibility reasons. We will remove it in the next release
        app.next_module = next.module;//we will use to work with collection model in repository.js
        logger.debug("[buildCollectionModel][app.CollectionDataSource]=", app.CollectionDataSource.settings.host +
          " DB =", app.CollectionDataSource.settings.database);
        return next(true);
      }

      else {
        logger.debug("--------------[getCOLLECTION] loadRepository---------------");
        loadRepository(app, req, res, function (repoModel) {
          if (repoModel) {
            var requestURL = req.params.repo_name + '/' + req.params.collection_name;
            // it searches for the collection_name requested path in repoModel
            findDataFromModel(app, requestURL, repoModel, function (coll_data) {
              if (coll_data) {
                // we have the info about collection_name. Check if we have a custom datasource to build
                if (!coll_data.collection_db || coll_data.collection_db == null) {

                  app.CollectionDataSource = RepoDataSource[req.params.repo_name].datasource;
                  var db_type = RepoDataSource[req.params.repo_name].datasource.settings.connector;
                  var db_name = RepoDataSource[req.params.repo_name].datasource.settings.database;

                } else {
                  eventEmitter.emit('getDataSource', app, coll_data);
                  var db_type = setDB_type(app, coll_data);
                  var db_name = setDB_name(app, coll_data);
                }

                if (coll_data.import == "true" || coll_data.import == true) {
                  logger.debug("-------[buildCollectionModel][Import Data]----------");
                  var modelTable = coll_data.tablename;
                  var modelName = modelTable;

                } else {
                  var modelTable = setModelTable(app, req.params);
                  var modelName = setModelName(app, req.params);

                }
                logger.debug("[buildCollectionModel][app.CollectionDataSource]=", app.CollectionDataSource.settings.host +
                  " DB =", app.CollectionDataSource.settings.database);
                logger.debug("[buildCollectionModel][modelTable]", modelTable);
                logger.debug("[buildCollectionModel][db_type]", db_type);
                logger.debug("[buildCollectionModel][db_name]", modelName);

                buildModelfromTable(app, db_type, db_name, modelTable, modelName, coll_data.path,
                  app.CollectionDataSource, function (model) {
                    if (model) {
                      logger.debug("[buildCollectionModel][buildModelfromTable][OK]");
                      if (coll_data.import == "true" || coll_data.import == true) {
                        var modelName = setModelName(app, req.params);
                        ModelTableMap[modelName] = {table: modelTable};
                        logger.stream.write("[buildCollectionModel]ModelTableMap[" + modelName + "]={table:" + modelTable + "}")
                        logger.debug("[buildCollectionModel]ModelTableMap[" + modelName + "]={table:" + modelTable + "}");
                      }
                      app.CollectionModelTable = modelTable;
                      logger.debug("[buildCollectionModel][app.CollectionModelTable]: ", app.CollectionModelTable)
                      next.module = model;//here for compatibility reasons. We will remove it in the next release
                      app.next_module = model;//we will use to work with collection model in repository.js
                      // sets relation btw Collection Model and Replica Model
                      setReplicaRelation(app, model, function (callback) {
                        if (callback) {
                          return next(true);
                        }
                      })

                    } else {
                      return res.status(500).send({error: 'error building model from table'});
                    }
                  })
              } else {
                return res.status(404).send({message: 'collection not found'});
              }
            })
          } else return res.status(404).send({message: 'the repository model does not exists.'});
        })
      }
    },

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    getDatasourceToWrite: function getDatasourceToWrite(req, res, next) {
      setupParameters(req, res, function (json_body) {
        next.body = json_body;


        app.bodyReadToWrite = json_body;
        if (!next.body.collection_db) {
          logger.debug("[getDatasourceToWrite][Nothing to do]");
          return next(false);
        } else {
          eventEmitter.emit('getDataSource', app, req.body);
          logger.debug("[getDatasourceToWrite][app.CollectionDataSource]=", app.CollectionDataSource.settings.host +
            " DB =", app.CollectionDataSource.settings.database);

          return next(true);
        }
      })
    },


    /*

     This FIX the id auto incement issue.

     */
    /**
     *
     * @param req
     * @param res
     * @param next
     */
    createPersistedModel: function createPersistedModel(req, res, next) {

      if (app.CollectionDataSource.settings.connector != 'mongodb') {
        var datasource = loopback.createDataSource(app.CollectionDataSource.settings);
        logger.debug("[createPersistedModel]:", datasource.settings, app.CollectionModelTable);

        datasource.discoverSchema(app.CollectionModelTable, {}, function (err, schema) {
          logger.debug("[createPersistedModel][discoverSchema][schema] :", schema);
          if (err) throw err;
          delete schema.properties.id;
          var collmodel = datasource.createModel(app.CollectionModelTable, schema.properties);
          app.persistedModel = collmodel;
          next.persistedModel = collmodel;
          next()
        })

      } else {
        logger.debug("[createPersistedModel][mongodb]");
        app.persistedModel = app.next_module;
        next.persistedModel = next.module;
        next()
      }
    },

    /**
     * todo: remove model for collection
     * @param req
     * @param res
     * @param next
     */
    removeModel: function removeModel(req, res, next) {

      var camelize = require('underscore.string');

      if(req.params.repo_name && req.params.collection_name) {
        var ModelName = camelize(req.params.repo_name).trim().capitalize().value()+
          camelize(req.params.collection_name).trim().capitalize().value();

      }
      if(req.params.repo_name && !req.params.collection_name) {
        var ModelName = camelize(req.params.repo_name).trim().capitalize().value()

      }

      app.models[ModelName] = null;
      next(true)

    },

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    buildpayload: function buildpayload(req, res, next) {
      setupParameters(req, res, function (json_body) {
        logger.debug("[buildpayload][saved body in next.body]");

        app.bodyReadToWrite = json_body;
        next.body = json_body;
        if (!json_body) return next(false)
        else next(true);
      })

    },

    /**
     *
     * @param req
     * @param res
     * @param next
     */
    validatebody: function validatebody(req, res, next) {
      validatereqbodyname(req.body, function (cb) {
        if (cb) return next(true)
        else return res.status(400).send({error: "Invalid request"})
      })
    },

    /**
     *
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    validateRelationBody: function validateRelationBody(req, res, next) {

      logger.debug("[validateRelationBody]", req.body);
      if (!req.body.relatedCollection || !req.body.fk)
        return res.status(400).send({error: "Invalid request"})
      var relation_name = (!req.body.name ? req.body.relatedCollection : req.body.name).toLowerCase();
      var relationbody = {
        "relatedCollection": req.body.relatedCollection.toLowerCase(),
        "fk": req.body.fk,
        "name": relation_name

      }
      logger.debug("[validateRelationBody][relationbody]", relationbody);
      next.relationbody = relationbody
      app.relationbody = relationbody
      next(true);
    },

    /**
     *
     * @param json
     * @param relationbody
     * @param next
     * @returns {*}
     */
    checkduplicate: function checkduplicate(json, relationbody, next) {
      if (json.length == 0) return next();
      if (findrelatedCollection(json, 'relatedCollection', relationbody.relatedCollection)) {
        return next(true)
      } else return next(false);
    }
  }
}

