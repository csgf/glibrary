/**
 * Created by Antonio Di Mariano on 05/06/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
var lt = require('loopback-testing');
var assert = require('assert');
var app = require('../server.js');
var request = require('request');

describe('/repositories :',function() {
  describe('1) POST /repositories',function() {
    it('should access ',function() {
      lt.beforeEach.withApp(app);
      app.models.User.login({
        email: 'bob@projects.com',
        password: 'opensesame'
      }, 'user', function(err, token) {
        token = token.toJSON();
        lt.describe.whenCalledRemotely('POST', '/api/repositories?access_token=' + token.id,
          {
            id:7,
            ownerId:2,
            name:"pirandello",
            location:"room_facility",
            path:"/pirandello",
            storage:"cloud"

          }, function (err, data) {
            lt.it.shouldBeAllowed()
          })
      })
    })
  })
})

describe('/api/pirandello :',function() {
  describe('2) GET /pirandello',function() {
    it('should access ',function() {
      lt.beforeEach.withApp(app);
      app.models.User.login({
        email: 'jane@doe.com',
        password: 'opensesame'
      }, 'user', function(err, token) {
        token = token.toJSON();
        lt.describe.whenCalledRemotely('GET', '/api/pirandello?access_token=' + token.id, function (err, data) {
          lt.it.shouldBeAllowed()
        })
      })
    })
  })
})
/*
describe('/api/pirandello :',function() {
  describe('3) GET /pirandello',function() {
    it('should denied ',function() {
      lt.beforeEach.withApp(app);
      app.models.User.login({
        email: 'bob@projects.com',
        password: 'opensesame'
      }, 'user', function(err, token) {
        token = token.toJSON();
        lt.describe.whenCalledRemotely('GET', '/api/pirandello?access_token=' + token.id, function (err, data) {
          lt.it.shouldBeAllowed()
        })
      })
    })
  })
})
describe('/api/pirandello :',function() {
  describe('4) GET /pirandello',function() {
    it('should denied ',function() {
      lt.beforeEach.withApp(app);
      app.models.User.login({
        email: 'john@doe.com',
        password: 'opensesame'
      }, 'user', function(err, token) {
        token = token.toJSON();
        lt.describe.whenCalledRemotely('GET', '/api/pirandello?access_token=' + token.id, function (err, data) {
          lt.it.shouldBeAllowed()
        })
      })
    })
  })
})
describe('/api/pirandello :',function() {
  describe('5) GET /pirandello',function() {
    it('should denied ',function() {
      lt.beforeEach.withApp(app);
      app.models.User.login({
        email: 'john@doe.com',
        password: 'opensesame'
      }, 'user', function(err, token) {
        token = token.toJSON();
        lt.describe.whenCalledRemotely('GET', '/api/pirandello', function (err, data) {
          lt.it.shouldBeAllowed()
        })
      })

    })
  })

})

describe('/pirandello :',function() {
  describe('6) POST /pirandello',function() {
    it('should access ',function() {
      lt.beforeEach.withApp(app);
      app.models.User.login({
        email: 'jane@doe.com',
        password: 'opensesame'
      }, 'user', function(err, token) {
        token = token.toJSON();
        lt.describe.whenCalledRemotely('POST', '/api/pirandello?access_token=' + token.id,
          {
            id:7,
            ownerId:2,
            name:"nathannever",
            location:"structure",
            path:"/pirandello/nathan",
            storage:"cloud"

          }, function (err, data) {
            lt.it.shouldBeAllowed()
          })
      })
    })
  })
})
describe('/pirandello/nathan :',function() {
  describe('7) GET /pirandello/nathan',function() {
    it('should access ',function() {
      lt.beforeEach.withApp(app);
      app.models.User.login({
        email: 'jane@doe.com',
        password: 'opensesame'
      }, 'user', function(err, token) {
        token = token.toJSON();
        lt.describe.whenCalledRemotely('GET', '/api/pirandello/nathan?access_token=' + token.id,
           function (err, data) {
            lt.it.shouldBeAllowed()
          })
      })
    })
  })
})

*/
