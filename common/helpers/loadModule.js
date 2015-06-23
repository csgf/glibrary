/**
 * Created by hellbreak on 23/06/15.
 */


module.exports.loadModule = function() {
  return true;
}
/**
 *
 * @param app
 * @param path
 * @param ds
 * @param table
 * @param callback
 * @returns {*}
 */
module.exports.getmodel = function(app,path,ds,table,callback)
{
  console.log("GETMODEL");
  if(!ds || !table) {
    console.log("FALSE");
    return callback(false);
  }

    table.findOne({
      where: { path : '/'+path}
    },function(err,data){
      if(err) return callback(false);
      if(!data) return callback(false);
      mapTableToModel(app,ds,data,function(obj){
        console.log("getModel return callback");
        return callback(obj);
      })
    })
}

/**
 *
 * @param app
 * @param datasource
 * @param data
 * @param callback
 */
var mapTableToModel =  function (app,datasource,data, callback)
{
  console.log("[mapTableToModel][data] :",data);

  var $model_path = data.path;
  var $model_name = data.name;
  var $table_name = data.location;
  var owner_id = data.ownerId;
  console.log("[mapTableToModel][data] :",$table_name);
  datasource.discoverAndBuildModels($table_name,
    {
      schema: 'public',
      base: 'PersistedModel',
      name: $model_name,
      plural: $model_path,
      http: {"path": $model_path}
    },
    function (er, models) {
      if (er) callback(err);
      for (var m in models) {
        var model = models[m];
        model.setup();
        app.model(model);
      }
      console.log('[ModelBuilder][Access new Model at *]: ', $model_path);
      callback(model);
    })
}
