/**
 * Created by hellbreak on 23/06/15.
 *
 * Persit data
 *
 *
 *
 */
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
      repoDB.createModel(schema_collection.name, schema_collection.properties, schema_collection.options);
      repoDB.autoupdate(schema_collection.name, function (err, result) {
        if (err) throw err;
        console.log("RESULT:",result);
        callback(true);
      })
    }
  })
}

var checkIfDataHasToBeImported = function(data,callback) {
  if(data.import == true && data.coll_db.location == "remote") {
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


