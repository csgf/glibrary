
Remember to fix DataSource.prototype.discoverAndBuildModels = function (modelName, options, cb) {..}
in  node_modules/loopback-datasource-juggler/lib/datasource.js to enable plural and http.path for dynamic modules


/*
          @author : Antonio Di Mariano


       */
      if (options.plural) {
        schema.options = schema.options || {};
        schema.options.plural = options.plural;
        schema.options.public = true;
      }
      if (options.http) {
        schema.options = schema.options || {};
        schema.options.http = options.http;
      }





/Users/hellbreak/Dev/INFN/gLibrary_base/node_modules/pkgcloud/lib/pkgcloud/openstack/context/service.js
Modifify with

else {
    _.each(self.endpoints, function(endpoint) {

      if (url) {
        return;
      }
      /**
       *  FIX [Error Unable to identify endpoint url error]  issue
       *  IF the endpoint.region field is not undefined AND url field is undefined at the same time,
       *  we will not receive a valid value inside the url field.
       *
        */
      else
      {
        url = getUrl(endpoint);
      }

      // return the first region-less endpoint
      if (!endpoint.region) {
        console.log("!endpoint.region");
        url = getUrl(endpoint);
        console.log("[URL]",url);
      }
    });
  }


/Users/hellbreak/Dev/INFN/gLibrary_base/node_modules/pkgcloud/lib/pkgcloud/openstack/context/identity.js


inserito il certificato
