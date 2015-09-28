/**
 * Created by Antonio Di Mariano on 23/06/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
var logger = require("../helpers/logger");

exports.createTable = function createTable(datasource, data, callback) {

  var repoDB = datasource;
  var table_name = data.name;

  checkIfDataHasToBeImported(data, function (cb) {
    if (cb) {
      logger.debug("[persist][Import Collection]");
      return callback(true);
    }
    else {
      var result = data.path;
      if (result && result.lastIndexOf('/') != -1) {
        modelName = result.split('/')[1] + "_" + result.split('/')[2];
      } else {
        modelName = table_name;
      }

      if (data.schema) {
        var schema_collection = {
          "name": modelName,
          "base": "PersistedModel",
          "idInjection": true,
          "options": {
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
            }
          }
        }
      }


      repoDB.createModel(modelName, schema_collection.properties, {"base": "PersistedModel", "idInjection": true});
      repoDB.autoupdate(modelName, function (err, result) {
        if (err) throw err;
        logger.debug("[persit][autoupdate on ", modelName + "]");
        callback(true);
      })
    }
  })
}

var checkIfDataHasToBeImported = function (data, callback) {
  if (data.import == "true" || data.import == true) { //cambiare in boolean
    callback(true);
  } else callback(false);

}
