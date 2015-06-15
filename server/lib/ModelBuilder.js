/**
 * Created by hellbreak on 06/06/15.
 */


module.exports = function ModelBuilder(app) {

  var postgreSQL = app.dataSources.postgreSQL;
  var repositoryDB = app.dataSources.repoDB;
  var typeDB = app.dataSources.typeDB;
  var RoleTools = require('./RoleTools')(app);
  var Role = app.models.Role;

  /*
   Todo: move in a deditaced lib
   */
  var principalId_value = 4;
  var principalType_value = 'repositoryOwner';

  var err = new Error();
  err.message = "[ModelBuilder][1] Authorization Required";
  err.code = "AUTHORIZATION REQUIRED";
  err.status = 401;
  err.statusCode = 401;


  return {

    mapTableToModel: function (datasource, data, callback) {

      /*
       nome del modello, path REST, nome della tabella, proprietario
       */
      var value = false;
      var $model_path = data.path;
      var $model_name = data.name;
      var $table_name = data.location;
      var owner_id = data.ownerId;
      console.log("DATA :",data);
      datasource.discoverAndBuildModels($table_name,
        {
          schema: 'public',
          base: 'PersistedModel',
          name: $model_name,
          plural: $model_path,
          http: {"path": $model_path}
        },
        function (er, models) {
          if (er) throw  er;
          for (var m in models) {
            var model = models[m];
            model.setup();

            console.log("VALORE M:", m);
            /*
             Role.findOne({
             where: {
             name: 'repositoryOwner'
             }
             }, function (err, role) {
             if (err) throw err;
             if(role) {
             role.principals.create({principalType: principalType_value, principalId: principalId_value, userId:owner_id}, function (err, p) {
             console.log("[ModelBuilder][principals]",p);
             });
             }
             else {
             console.log("[ModelBuilder][No Role found]");
             }
             });
             */
            /* Espongo il modello in REST*/
            app.model(model);
            /* *
             *   con il metodo beforeRemote, Controllo l'accesso ai vari endpoint del tipo /deroberto
             *   creati in fase di boot, dalla lettura del DB associato con il modello repository
             *
             * */

            if (data.subrepo) {
              model.beforeRemote('*', function (context, user, next) {

                if(context.method.http.verb == 'post') {
                  var req = context.req
                  /* creo voce nel repository. Esempio /pirandello/opere */
                  var data2 = req.body;
                  console.log("POST METHOD ->>> REQ:",data2);
                  process.nextTick(function(){
                    md = new ModelBuilder(app);
                    md.mapTableToModel(postgreSQL,data2,function(cb2){
                      console.log("[ModelBuilder][recursive call mapTableToModel]",cb2);
                      next();
                    })
                  })
                } else next();


                /*
                 if (ctx.req.accessToken) {
                 console.log("[ModelBuilder] model.beforeRemore accessToken:", ctx.req.accessToken);
                 var data = {
                 principalType_value: principalType_value,
                 principalId_value: principalId_value,
                 userId: ctx.req.accessToken.userId
                 }
                 //assegno il Role ai nuovi metodi
                 RoleTools.checkModelRole(app, data, function (callback) {
                 if (callback) {
                 console.log("[ModelBuilder][AccessGranted]:");
                 next();
                 }
                 else {
                 console.log("[ModelBuilder][AccessDenied]:");
                 next(err);
                 }
                 })
                 } else {
                 //l'utente non è loggato
                 return next(err);
                 }
                 */

              });
            }
          }
          console.log('[ModelBuilder][Access new Model at *]: ', $model_path);
          callback(m);
        })

    },
    populateRepository: function (callback) {
      repositoryDB.automigrate('repository', function (err) {
        if (err) throw err;
        app.models.repository.create([], function (err, repo) {
          if (err) throw err;
          console.log('[ModelBuilder]Models created: \n', repo);
          callback(true);

        });
      })
    },
    populateType: function (callback) {
      repositoryDB.automigrate('repositoryType', function (err) {
        if (err) throw err;
        app.models.repositoryType.create([], function (err, type) {
          if (err) throw err;
          console.log('[ModelBuilder]Models created: \n', type);
          callback(true);

        });
      })
    },
    createRepositoryRole: function (callback) {
      Role.create({
        name: principalType_value
      }, function (err, role) {
        if (err) throw err;
        callback(true);
      })
    },
    createDynamicModel: function (datasource, data, callback) {
     /*
      var keys = Object.keys(data);
      console.log("KEYS::::",data);

      for (var i = 0, length = keys.length; i < length; i++) {
        console.log("DATA::::",data[keys[i]]);
        data[keys[i]].startbeforeRemote = true; // enable second layer of models discovery method

        this.mapTableToModel(datasource, data[keys[i]], function (cb) {*/
         this.mapTableToModel(datasource,data,function(cb){
          console.log("[boot_repository][createDynamicModel callback]", cb);
          if (cb) {
            callback(true);
          } else {
            callback(false);
          }
        });
      //}
    }
  }
}
