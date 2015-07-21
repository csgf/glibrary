/**
 * Created by Antonio Di Mariano on 23/06/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
var camelize = require('underscore.string');

exports.createTable = function createTable(datasource, data, callback) {
  console.log("[persistData]", data);
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
   */

  checkIfDataHasToBeImported(data,function(cb){
    if(cb) {
      console.log("checkIfDataHasToBeImported TRUE");
      return callback(true);
    }
    else {
      console.log("checkIfDataHasToBeImported FALSE");

      if (data.schema) {
        var schema_collection = {
          "name": table_name,
          "base": "PersistedModel",
          "idInjection": true,
          "options": {
            "validateUpsert": true
          },
          "properties": data.schema
        }
      } else {
        var schema_collection = {
          "name": table_name,
          "base": "PersistedModel",
          "idInjection": false,
          "options": {
            "validateUpsert": true
          },
          "properties": {

            "firstname": {
              "type": "string",
              "required": true
            },
            "lastname": {
              "type": "string",
              "required": true
            },
            "location": {
              "type": "string",
              "required": true
            },
            "hobby": {
              "type": "string",
              "required": true
              }
            }
        }

      }

      var modelName;

      var result = data.path;

      if( result.lastIndexOf('/') != -1) {
        console.log("COLLECTION PATH",result);
        console.log("First part",result.split('/')[1])
        console.log("Second part",result.split('/')[2]);

           modelName = camelize(result.split('/')[1]).trim().capitalize().value() + "_" +
                        camelize(result.split('/')[2]).trim().capitalize().value()
          console.log("modelName----->",modelName)
      } else{
          modelName = camelize(schema_collection.name).trim().capitalize().value()
          console.log("modelName----->",modelName)
      }
      repoDB.createModel(modelName, schema_collection.properties, schema_collection.options);
      repoDB.autoupdate(modelName, function (err, result) {
        if (err) throw err;
        console.log("Model:",modelName);
        callback(true);
      })
    }
  })
}

var checkIfDataHasToBeImported = function(data,callback) {
  console.log("DATA",data.import);
  if(data.import == "true" || data.import == true ) { //cambiare in boolean
    console.log("[PERSIST] Data has to be Impoterd");
    callback(true);
  } else callback(false);

}


exports.importTable = function importTable(datasource, data, callback) {


  datasource.discoverSchema('montalbano', {schema: 'public'},
    function (err, schema) {
      if (err) throw err;
      console.log(JSON.stringify(schema, null, '  '));
    });


}


