/**
 * Created by hellbreak on 23/06/15.
 */
exports.createTable =  function createTable(datasource,data,callback) {
  console.log("[persistData]",data);
  var repoDB = datasource;
  var table_name = data.name;
  var schema_collection = {
    "name": table_name,
    "base": "PersistedModel",
    "options": {
      "idInjection": false,
      "postgresql": {
        "schema": "public",
        "table": table_name
      }
    },

    "properties": {
      "id": {
        "type": "number",
        "id": true,
        "generated": true
      },

      "name": {
        "type": "String",
        "lenght": 20
      },
      "path": {
        "type": "String",
        "lenght": 20
      },
      "location" : {
        "type": "String",
        "length":20
      },
      "owner_id": {
        "type": "String",
        "length":20
      },
      "VisibleAttrs": {
        "type": "String",
        "lenght": 20
      },
      "FilterAttrs": {
        "type": "String",
        "lenght": 20
      },
      "ColumnWidth": {
        "type": "String",
        "lenght": 20
      },
      "ParentID": {
        "type": "number"
      },
      "Type": {
        "type": "number"
      }
    }
  }

  repoDB.createModel(schema_collection.name, schema_collection.properties, schema_collection.options);
  repoDB.autoupdate(schema_collection.name,function (err,result) {
    if(err) throw err;
    callback(true);

  })

}


