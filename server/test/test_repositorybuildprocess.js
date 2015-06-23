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
/*
describe('1) GET /v1/repos',function() {
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
*/

describe('1) Request repositories list',function() {
      lt.beforeEach.withApp(app);
      lt.describe.whenCalledRemotely('GET', '/v1/repos', function () {
          lt.it.shouldBeAllowed()
        })
})

describe('2) Request  metadata about "<repository_name>" ',function(){
  lt.beforeEach.withApp(app);
  lt.describe.whenCalledRemotely('GET','/v1/repos/verga',function(){
    lt.it.shouldBeAllowed()
  })
})
describe('3) Request a not existing repository ',function(){
  lt.beforeEach.withApp(app);
  lt.describe.whenCalledRemotely('GET','/v1/repos/doesnotexist',function(){
    lt.it.shouldNotBeFound();
  })
})

/*
describe('4) Create a new repository',function(){
  lt.beforeEach.withApp(app);
  var data = {
    "id": 999,
    "ownerId": 2,
    "name": "myrepo",
    "location": "myrepo",
    "path": "/myrepo",
    "storage": "cloud",
    "subrepo": true

  }
  lt.describe.whenCalledRemotely('POST','/v1/repos',data,function(){
    lt.it.shouldBeAllowed();
  })
})
*/
describe('5) Create new collection',function(){
  lt.beforeEach.withApp(app);
  var data = {
    "id": 1,
    "typename": "firstcollection",
    "path": "/myrepo/firstcollection",
    "visibleattrs": "attr1",
    "filterattrs": "filter1",
    "columnwidth": "10",
    "parentid": 4,
    "type": 2
  }
  lt.describe.whenCalledRemotely('POST','/v1/repos/myrepo',data,function(){
    lt.it.shouldBeAllowed();
  })
})
