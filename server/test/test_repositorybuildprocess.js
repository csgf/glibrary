/**
 * Created by hellbreak on 10/06/15.
 */
/**
 * Created by hellbreak on 05/06/15.
 */
var lt = require('loopback-testing');
var assert = require('assert');
var app = require('../server.js');
var request = require('request');

describe('1) POST /repositories',function() {
    it('should access ',function() {
      lt.beforeEach.withApp(app);
      lt.describe.whenCalledRemotely('POST', '/api/repositories',
          {
            id:999,
            ownerId:2,
            name:"nathan_never",
            location:"room_facility",
            path:"/nathan_never",
            storage:"cloud"

          }, function (err, data) {
            lt.it.shouldBeAllowed()
          })
      })
    })

describe('2) GET /nathan_never',function() {
    it('should access ',function() {
      lt.beforeEach.withApp(app);
      lt.describe.whenCalledRemotely('GET', '/api/nathan_never', function (err, data) {
          lt.it.shouldBeAllowed()
        })
      })
})


describe('3) POST api/nathan_never',function() {
     it('should access ',function() {
      lt.beforeEach.withApp(app);
      lt.describe.whenCalledRemotely('POST', '/api/nathan_never',
        {
          id:7,
          repositoryId:999,
          ownerId:2,
          name:"Nathan Never Storie",
          location:"structure",
          path:"/contents/nathan_never/storie",
          storage:"cloud"

       }, function (err, data) {
          lt.it.shouldBeAllowed()
      })
     })
})
