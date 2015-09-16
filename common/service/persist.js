/**
 * Created by Antonio Di Mariano on 23/06/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
var camelize = require('underscore.string');
var logger = require("../helpers/logger");


exports.createTable = function createTable(datasource, data, callback) {

  var repoDB = datasource;
  var table_name = data.name;

  /*var schema_collection = {
   "name" : table_name,
   "base": "PersistedModel",
   "idInjection": true,
   "options": {
   "validateUpsert": true
   },
   "properties": {
   "ownerId": {
   "type": "number"
   },
   "name": {
   "type": "string",
   "required": true
   },
   "location": {
   "type": "string",
   "required": true
   },
   "path": {
   "type": "string",
   "required": true
   },
   "storage": {
   "type": "string",
   "required": true
   },

   "host": {
   "type": "string"
   },
   "port": {
   "type": "number"
   },
   "database": {
   "type": "string"
   },
   "username": {
   "type": "string"
   },
   "password": {
   "type": "string"
   },
   "connector": {
   "type": "string"
   }
   }
   }
   "id" : {
   type: "Number",
   generated: true,
   id: true
   },

   */

  checkIfDataHasToBeImported(data,function(cb){
    if(cb) {
      logger.debug("[persist][Import Collection]");
      return callback(true);
    }
    else {

      var result = data.path;
      if (result && result.lastIndexOf('/') != -1) {
        //console.log("COLLECTION PATH",result);
        //console.log("First part",result.split('/')[1])
        //console.log("Second part",result.split('/')[2]);

        /*
         modelName = camelize(result.split('/')[1]).trim().capitalize().value() + "_" +
         camelize(result.split('/')[2]).trim().capitalize().value()
         */
        modelName =  result.split('/')[1]+"_"+result.split('/')[2];

      } else{
        modelName = schema_collection.name;
        //modelName = camelize(schema_collection.name).trim().capitalize().value()
      }


      if (data.schema) {
        var schema_collection = {
          "name": modelName,
          "base": "PersistedModel",
          "idInjection": true,

          "options" : {
            "validateUpsert": false

          },
          "properties": data.schema
        }
      }
      else {
        var schema_collection = {
          "name": modelName,
          "base": "PersistedModel",
          "idInjection": true,
          "options": {
            "validateUpsert": false
          },

          "properties": {


            "firstname": {
              "type": "string",
              "required": true
            },
            "lastname": {
              "type": "string",
              "required": false
            },
            "location": {
              "type": "string",
              "required": false
            },
            "hobby": {
              "type": "string",
              "required": false
              }
            }
        }

      }

      repoDB.createModel(modelName, schema_collection.properties, {"base": "PersistedModel", "idInjection": true});
      //repoDB.createModel(schema_collection);
      repoDB.autoupdate(modelName, function (err, result) {
        if (err) throw err;
        logger.debug("[persit][autoupdate on ",modelName+"]");
        callback(true);
      })
    }
  })
}

var checkIfDataHasToBeImported = function(data,callback) {
  if(data.import == "true" || data.import == true ) { //cambiare in boolean
    callback(true);
  } else callback(false);

}
