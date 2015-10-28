/**
 * Created by Antonio Di Mariano on 19/10/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */

var lt = require('loopback-testing');
var app = require('../server.js');
var assert = require('assert');

var url = '/v2/repos/';

var local_repo = {
  "name": "contea"
}


describe('Trying to GET /v2/repos/contea ',function() {


  beforeEach(function() {
    lt.beforeEach.withApp(app);
  });

  it('Trying with no access_token-> should be Denied',function() {

    lt.describe.whenCalledRemotely('GET', url + local_repo.name , function () {
      lt.it.shouldBeDenied()
    })

  });

  it('Trying with no allowed user-> should be Denied',function() {
      app.models.user.login({
        email: 'jane@doe.com',
        password: 'opensesame'
      },  function(err, token) {
        token = token.toJSON();
        lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/?access_token='+ token.id, function (err, data) {
          console.log("DATA:",data);
          lt.it.shouldBeDenied()
        })
      })
  });
  it('Access with admin user > should access ',function() {
    app.models.user.login({
      email: 'nathan@gmail.com',
      password: 'opensesame'
    },  function(err, token) {
      token = token.toJSON();
      lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/?access_token='+ token.id, function (err, data) {
        lt.it.shouldBeAllowed()
      })
    })
  });
  it('Access with repoA user -> should access ',function() {
    app.models.user.login({
      email: 'bob@projects.com',
      password: 'opensesame'
    },  function(err, token) {
      token = token.toJSON();
      lt.describe.whenCalledRemotely('GET', url + local_repo.name + '/?access_token='+ token.id, function (err, data) {
        lt.it.shouldBeAllowed()
      })
    })
  });
  it('Access  with repoA user -> should be denied',function() {
    app.models.user.login({
      email: 'bob@projects.com',
      password: 'opensesame'
    },  function(err, token) {
      token = token.toJSON();
      lt.describe.whenCalledRemotely('GET', url + '?access_token='+ token.id, function (err, data) {
        lt.it.shouldBeDenied()
      })
    })
  })

})

