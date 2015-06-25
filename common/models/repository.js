module.exports = function(Repository) {

  userId = null;

  var fs = require('fs');
  var https = require('https');
  var path = require('path');
  var request = require('request');

  /**
   * Event Observe
   */

  Repository.observe('before delete', function (ctx, next) {
    console.log('Going to delete %s matching %j',
      ctx.Model.pluralModelName,
      ctx.where, ctx.app);
    next();
  });

  Repository.beforeRemote('list_repositories', function (context, user, next) {
    var req = context.req;
    req.body.publisherId = req.accessToken.userId;
    userId = req.accessToken.userId;
    next();
  })


  Repository.remoteMethod('openstack_login', {
    returns: {arg: 'client', type: 'object'},
    http: {path: '/openstackLogin', verb: 'get'}
  })

  Repository.remoteMethod('testhttps', {
    returns: {arg: 'client', type: 'object'},
    http: {path: '/testRequest', verb: 'get'}
  })

  Repository.remoteMethod('login_repository', {
    accepts: {arg: 'req', type: 'object', http: {source: 'body'}},
    returns: {arg: 'repositories', type: 'array'},
    http: {path: '/login_repository', verb: 'post'}
  });


  Repository.remoteMethod('list_repositories', {
    returns: {arg: 'repositories', type: 'array'},
    http: {path: '/list_repositories', verb: 'get'}
  });


  Repository.list_repositories = function (next) {
    Repository.find({
      where: {
        ownerId: userId
      }
    }, next);
  };

  Repository.openstack_login = function (req, next) {

    var client = require('pkgcloud').storage.createClient({
      provider: 'openstack',
      username: 'acaland',
      password: 'demo2015',
      tenantName: 'glibrary',
      authUrl: 'https://stack-server-01.ct.infn.it:35357/',
      options: {
        ca: fs.readFileSync(path.join(__dirname, '../../server/private/INFNCA.pem')).toString()


      }
    });


    client.getContainers(function (err, containers) {
      if (err) throw err;
      console.log("****CONTAINERS****:");
      containers.forEach(function (value) {
        console.log("VALUE:", value.name);
      })
    })

    client.getFiles('demo', function (err, files) {
      if (err) throw err;
      // console.log("FILES:",files);
    })
    client.getFile('demo', 'ananas33.jpg', function (err, server) {
      // console.log("GETFILE:",server);
    })
    client.download({
      container: 'demo',
      remote: 'ananas33.jpg'
    }).pipe(fs.createWriteStream('download_ananas33.jpg'));


  }
  Repository.testhttps = function (req, next) {


    var testData = {
      "uri": "https://stack-server-01.ct.infn.it:35357/v2.0/tokens",
      "method": "POST",
      "headers": {
        "User-Agent": "nodejs-pkgcloud/1.2.0-alpha.0",
        "Content-Type": "application/json", "Accept": "application/json"
      },
      "json": {
        "auth": {
          "passwordCredentials": {"username": "acaland", "password": "demo2015"},
          "tenantName": "glibrary"
        }
      },
      "ca": "-----BEGIN CERTIFICATE-----\nMIIDczCCAlugAwIBAgIBADANBgkqhkiG9w0BAQUFADAuMQswCQYDVQQGEwJJVDEN\nMAsGA1UEChMESU5GTjEQMA4GA1UEAxMHSU5GTiBDQTAeFw0wNjEwMDMxNDE2NDda\nFw0xNjEwMDMxNDE2NDdaMC4xCzAJBgNVBAYTAklUMQ0wCwYDVQQKEwRJTkZOMRAw\nDgYDVQQDEwdJTkZOIENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\nzpWODoOVnUKpyikjyrdj+QpJuoJeKkqF4fbd6LrqeQL0dqAiluVR8D4y/T2Mqvsd\nH/fg0s3EYZUDQZimcAmC3ammTX3rqXOz34GWLGpXoXAmUVKWPNFJo6rAEwhw3Sja\na8mEjMiZE/JigHN5RI8K6taKtjL/jE4XUTZOGbvlKsROxzJPM6bO4GJdYO+qhK9E\n5HsbV699DYyukBfUB6ChtD6GDbcdPKUKwheni5j0v6smFjiBEb3VQg4O+uBWTHMP\n116L9kPY+I7ojzXLuayMTd+6TXzunR33+v6h8AtLChcQRt4vj7oG/scTg3eSnFsq\noEO4D4IF9v481GJJwg58LwIDAQABo4GbMIGYMA8GA1UdEwEB/wQFMAMBAf8wDgYD\nVR0PAQH/BAQDAgEGMB0GA1UdDgQWBBTRYvOzd3LILvvyeRpvN04nnxPVIDBWBgNV\nHSMETzBNgBTRYvOzd3LILvvyeRpvN04nnxPVIKEypDAwLjELMAkGA1UEBhMCSVQx\nDTALBgNVBAoTBElORk4xEDAOBgNVBAMTB0lORk4gQ0GCAQAwDQYJKoZIhvcNAQEF\nBQADggEBAHjX0z+3P3JyQGIBI5aAXOS3NuDEf0MdqCLFIGsXjtvIm2kDSMSGQOg5\nuZnJLTAhaT+gX5eNkDdzhuuJEgW1FPGDy2If6zgD4T4EsS50E+L5BTNOG78UzF4H\n9DGBlbrkD8VEug9RpxGusSweGGlnO6CT/U1Tb3XY5ZjIrMubh09UwmjK9nEIe3vC\nRPInAkbmamteezpKOqC5Knj0ZpqU+CnWkuyYnjslX1e9O5lbupLTp5NOqZRCFn1i\niTjpoNefgqLE3sHedgb2P1vS8lO+EIhRnWgfN9qAHSqkQ+ZObxIfPJFdcluu8d/K\ntXsFkKmmFuEHd0SrYpBh9ZCLDgq2x9Y=\n-----END CERTIFICATE-----\n"
    };
    var cert = fs.readFileSync(path.join(__dirname, '../../server/private/INFNCA.pem')).toString();

    var requestData = {
      auth: {
        'tenantName': 'glibrary',
        'passwordCredentials': {
          'username': 'acaland',
          'password': 'demo2015'
        }
      }
    }

    request(testData, function (err, response, body) {
      if (err) throw err;
      console.log("RES", response.statusCode);
      console.log("BODY", body);
    })
    /*

     request({
     url: 'https://stack-server-01.ct.infn.it:35357/v2.0/tokens',
     method: "POST",
     headers: {
     "content-type": "application/json",
     },

     ca: cert,
     body: JSON.stringify(requestData)
     },function(err,res,body) {
     if(err) throw err;
     console.log("RES:",res.statusCode);
     console.log("BODY",body);

     });
     */
  }


}
