/**
 * Created by hellbreak on 28/05/15.
 */

var modelBuilder = require('../lib/ModelBuilder');
module.exports = function(app) {
  var md = new modelBuilder(app);
  var postgreSQL = app.dataSources.postgreSQL;
  var repoDB = app.dataSources.repoDB;

  /*
    var Curl = require( 'node-libcurl' ).Curl,
      querystring = require( 'querystring' );

    var curl = new Curl(),
      url  = 'https://stack-server-01.ct.infn.it:35357/v2.0/tokensinnern'
      data = {
        auth: {
          'tenantName': 'glibrary',
          'passwordCredentials': {
            'username': 'acaland',
            'password': 'demo2015'
          }
         },

          'Content-Length': 5,
          'Content-Type': 'application/json'


      };

  //You need to build the query string,
  // node has this helper function, but it's limited for real use cases (no support for array values for example)
    data = querystring.stringify( data );

    curl.setOpt( Curl.option.URL, url );
    curl.setOpt( Curl.option.POSTFIELDS, data );
    curl.setOpt( Curl.option.VERBOSE, true );
    curl.setOpt(Curl.option.HEADER,'Content-Type: application/json');
    console.log( querystring.stringify( data ) );

    curl.perform();

    curl.on( 'end', function( statusCode, body ) {

      console.log( "END",body );

      this.close();
    });

    curl.on( 'error', curl.close.bind( curl ) );

  */


  md.createRepositoryRole(function(cb){
    if(cb) {

      console.log("[boot_repository][Repository Role created]");
      createAllRepositoriesModelOnTheFly(function(callback){
        if(callback) {
          console.log("[boot_repository][create All Repository Model]:DONE");
        }
      });
    } else {
      console.log("[boot_repository][Error on creating Repository Role]");
    }
  })


  function createAllRepositoriesModelOnTheFly(callback) {
    md = new modelBuilder(app);

    app.models.repository.find(function(err,data){
      if(err) throw err;
      var keys = Object.keys( data );
      for( var i = 0,length = keys.length; i < length; i++ ) {
        data[keys[i]].startbeforeRemote = true;
       // console.log("REPOSITORY",data[keys[i]]);
        md.createDynamicModel(repoDB,data[keys[i]],function(cb) {
          //console.log("[boot_repository][createDynamicModel callback]",cb,i);
          //  collectionModel = app.models.Collection;

        //  cb.hasMany(collectionModel,{foreignKey: 'repoId', as: 'collections'})

        });
      }
  })
    /*
    app.models.repositoryType.find(function(err,data2){
      if(err) throw err;
      var keys = Object.keys( data2);
      for ( var j = 0, length = keys.length; j < length; j++) {
        md.createDynamicModel(postgreSQL,data2[keys[j]],function(cb2){
          console.log("RITORNO 2::::::::",cb2);
        })
      }
    })
    */





    callback(true);
  }

}


