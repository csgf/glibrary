
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

