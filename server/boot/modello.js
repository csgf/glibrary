/**
 * Created by Antonio Di Mariano on 17/09/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */

var loopback = require('loopback');


module.exports = function(app) {
  var dataSource = app.dataSources.repoDB;

/*
  dataSource.automigrate('ACL', function (err) {
    if (err) throw err;

    console.log('ACL model migrated');
  });
  dataSource.automigrate('Role', function (err) {
    if (err) throw err;

    console.log('Role model migrated');
  });
  dataSource.automigrate('RoleMapping', function (err) {
    if (err) throw err;

    console.log('RoleMapping model migrated');
  });

  dataSource.automigrate('AccessToken', function (err) {
    if (err) throw err;

    console.log('AccessToken model migrated');
  });
*/
/*
  var coll_ds = {
    "host": "fiqurinia.com",
    "port": "5432",
    "username": "glibrary",
    "password": "nathan_never",
    "database": "glibrary",
    "connector": "postgresql"
  }
  var schema_properties = {


    "firstname": {
      "type": "string",
      "required": true
    }
  }
  try {
    var datasource = loopback.createDataSource(coll_ds);

    console.log("datasource:", datasource.settings.host);

    datasource.discoverSchema('last',{},function(err,schema) {
      if(err) throw err;
      console.log("SCHEMA:",schema);
      var  collmodel = datasource.createModel('Last',schema_properties);
      collmodel.create({"firstname":"ANTONIO"},function(err,result){
        if (err) throw err;
        console.log("Inserimento nel modello riuscito")
      })

    })

/*
    var  collmodel = datasource.discoverAndBuildModels('last',{schema:'public', "base": "PersistedModel",
    },function(err,models) {
      models.Last.create({"firstname":"123ANtonio"}, function (err, result) {
        if (err) throw err;
        console.log("Inseimento nel modello issue_september");
      })

    })
*/
  /*
  } catch (e) {
    logger.debug("loopback.createDataSource ERROR");
    console.error(e);
    console.trace(e);
  }

*/
/*
  var repo_data = {
    "name": "issue",
    "coll_db": {
      "host": "fiqurinia.com",
      "port": "5432",
      "username": "glibrary",
      "password": "nathan_never",
      "database": "glibrary",
      "type": "postgresql",
     }
  }

  var coll_ds = {
      "host": "fiqurinia.com",
      "port": "5432",
      "username": "glibrary",
      "password": "nathan_never",
      "database": "glibrary",
      "connector": "postgresql"
  }

  var schema_properties = {


    "firstname": {
      "type": "string",
        "required": true
    }
  }


  var data = {
    "firstname" : "Antonio"
  }

  var localdb = app.dataSources.repoDB;
  console.log("localdb:",localdb.settings.host +
    " DB =",localdb.settings.database);
  var  repomodel = localdb.createModel('issue',{});
  localdb.autoupdate('issue',function(err,result){
    if(err) throw err;
    console.log("Modello issue creato")
  })
  repomodel.create(repo_data,function(err,result){
    if (err) throw err;
    console.log("Inserimento nel modello issue")
  })
  try {
    var datasource = loopback.createDataSource(coll_ds);
    console.log("datasource:", datasource.settings.host);
    var  collmodel = datasource.createModel('issue_november',schema_properties);
    datasource.autoupdate('issue_november',function(err,result){
      if (err) throw err;
      console.log("Modello issue_november creato")
    })
  } catch (e) {
    logger.debug("loopback.createDataSource ERROR");
    console.error(e);
    console.trace(e);
  }
  collmodel.create(data,function(err,result){
    if (err) throw err;
    console.log("Inseimento nel modello issue_movembe");
  })
*/


}

