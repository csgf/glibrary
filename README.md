Run the beta
1) install LoopBack framework npm install -g strongloop
2) run npm install
3) node .


Work in progress note

In order to run this beta version of gLibrary you need to add/modify some portion of some libraries.

Step1 :  enable plural and http.path for dynamic modules

 After you did a npm install in order to install all the necessary dependencies, you have to

  a) edit node_modules/loopback-datasource-juggler/lib/datasource.js

  b) go to the DataSource.prototype.discoverAndBuildModels = function (modelName, options, cb) {..}
  c) after
                if (options.plural) {
                   schema.options = schema.options || {};
                   schema.options.plural = options.plural;
                   schema.options.public = true;
                 }


     add the following
                 if (options.http) {
                   schema.options = schema.options || {};
                   schema.options.http = options.http;
                 }
                 if (options.base) {
                   schema.options = schema.options || {};
                   schema.options.base = options.base;
                 }



Step2: FIX [Error Unable to identify endpoint url error]  issue
*  IF the endpoint.region field is not undefined AND url field is undefined at the same time,
*  we will not receive a valid value inside the url field.

a) edit node_modules/pkgcloud/lib/pkgcloud/openstack/context/service.js
b) go to Service.prototype.getEndpointUrl = function (options) {..}
c) modify with the code belove

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


Step3 : Enable SSL certiticate authentication openstack
a) edit node_modules/pkgcloud/lib/pkgcloud/openstack/context/identity.js
b) go to Identity.prototype._buildAuthenticationPayload = function () {..}
c) substitute the original code with the one above

Identity.prototype._buildAuthenticationPayload = function () {
  var self = this;
  var fs = require('fs');


  /* Todo : move ca_cert in self.options */

  var ca_cert_path = '/Users/hellbreak/Dev/INFN/gLibrary_base/server/private/INFNCA.pem';
  var cert = fs.readFileSync(ca_cert_path).toString();
  self.options.ca = cert;
  console.log("[IDENTITY][_buildAuthenticationPayload]",self.options);
  self.emit('log::trace', 'Building Openstack Identity Auth Payload');

  // setup our inputs for authorization
  if (self.options.password && self.options.username) {
    self._authenticationPayload = {
      auth: {
        passwordCredentials: {
          username: self.options.username,
          password: self.options.password
        }
      }
    };
  }
  // Token and tenant are also valid inputs
  else if (self.options.token && (self.options.tenantId || self.options.tenantName)) {
    self._authenticationPayload = {
      auth: {
        token: {
          id: self.options.token
        }
      }
    };
  }
};
