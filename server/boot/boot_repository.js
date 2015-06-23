/**
 * Created by hellbreak on 28/05/15.
 */

var modelBuilder = require('../lib/ModelBuilder');
module.exports = function(app) {
  var md = new modelBuilder(app);
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




/*
  md.createRepositoryRole(function(cb){
    if(cb) {
      console.log("[boot_repository][Repository Role created]");
      createAllRepositoriesModelOnTheFly(function(callback){
        if(callback) {
          console.log("[boot_repository][create All Repository Model]:DONE");
          return;
        }
      });
    } else {
      console.log("[boot_repository][Error on creating Repository Role]");
    }
  })
*/




  /**
   * Leggo dalla tabella repository e mappo il model. Leggo ogni repo_name e mappo le collection
   * @param callback
   */
  function createAllRepositoriesModelOnTheFly(callback) {






    app.models.repository.find(function(err,data){
      if(err) throw err;
      var keys = Object.keys( data );

      for( var i = 0,length = keys.length; i < length; i++ ) {
        var nome = data[keys[i]].name
        md.mapTableToModel(repoDB,data[keys[i]],function(cb) {

          var modelName = nome.charAt(0).toUpperCase() + nome.substring(1);
          var collection_model = app.models[modelName];

          collection_model.find(function(err,data2) {
            if (err) throw err;
            var keys = Object.keys(data2);

            for (var j = 0, length = keys.length; j < length; j++) {
              md.mapTableToModel(repoDB, data2[keys[j]], function (cb) {
              })
            }
          })
          //console.log("[boot_repository][createDynamicModel callback]",cb,i);
        });
      }
    })
    callback(true);
  }

}


