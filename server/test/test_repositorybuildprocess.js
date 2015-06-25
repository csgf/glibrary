/**
 * Created by hellbreak on 10/06/15.
 */

var lt = require('loopback-testing');
var assert = require('assert');
var app = require('../server.js');
var request = require('request');


var POST_repos_data =
{
  "id":99,
  "ownerId": 2,
  "name": "nathan",
  "location": "nathan",
  "path": "/nathan",
  "storage": "cloud",
  "subrepo": true
}
var POST_reponame_data = {
  "id":1,
  "ownerId": 2,
  "name": "girls",
  "location": "girls",
  "path": "/nathan/girls",
  "storage": "cloud",
  "subrepo": true
}




describe('1)----[repository][CRUD TEST]----',function() {
      lt.beforeEach.withApp(app);
      lt.describe.whenCalledRemotely('GET', '/v1/repos/donotexist', function () {
        lt.it.shouldNotBeFound()
      })

      lt.describe.whenCalledRemotely('POST','/v1/repos/',POST_repos_data,function(){
        lt.it.shouldBeAllowed()
      })
      lt.describe.whenCalledRemotely('GET','/v1/repos/nathan',function(){
        lt.it.shouldBeAllowed()
      })
      lt.describe.whenCalledRemotely('DELETE','/v1/repos/nathan',function(){
        lt.it.shouldBeAllowed()
      })
      lt.describe.whenCalledRemotely('GET', '/v1/repos/nathn',function(){
        lt.it.shouldNotBeFound()
      })
})
describe('2)----[collection][CRUD TEST]----',function(){
      lt.beforeEach.withApp(app);

      lt.describe.whenCalledRemotely('POST','/v1/repos/',POST_repos_data,function(){
        lt.it.shouldBeAllowed()
      })
      lt.describe.whenCalledRemotely('POST','/v1/repos/nathan',  POST_reponame_data,function(){
        lt.it.shouldBeAllowed()
      })
      lt.describe.whenCalledRemotely('GET','/v1/repos/nathan/girls',function(){
        lt.it.shouldBeAllowed()
      })

      lt.describe.whenCalledRemotely('POST', '/v1/repos/nathan/girls', {
          "id": 1,
          "name": "agent1",
          "path": "/nathan/girls/1",
          "location": "agent",
          "ownerId": "2",
          "visibleattrs": "Agenzia Alpha Agent Legs ",
          "filterattrs": "Filtri Agenzia Alpha Legs ",
          "columnwidth": "100",
          "parentid": 2,
          "type": null
        },function () {
          lt.it.shouldBeAllowed()
        })
      lt.describe.whenCalledRemotely('PUT', '/v1/repos/nathan/girls', {
        "id": 1,
        "name": "agent1",
        "path": "/nathan/girls/1",
        "location": "agent",
        "ownerId": "2",
        "visibleattrs": "Agenzia Alpha Special Agent Legs ",
        "filterattrs": "Filtri Agenzia Special Alpha Agent Legs ",
        "columnwidth": "100",
        "parentid": 2,
        "type": null
      },function () {
        lt.it.shouldBeAllowed()
      })


      lt.describe.whenCalledRemotely('DELETE', '/v1/repos/nathan/girls',function(){
        lt.it.shouldBeAllowed()
      })
      lt.describe.whenCalledRemotely('GET', '/v1/repos/nathan/girls',function(){
        lt.it.shouldNotBeFound()
      })
})
describe('3)---[item][CRUD TEST]----',function(){
      lt.beforeEach.withApp(app);

      lt.describe.whenCalledRemotely('POST','/v1/repos/nathan',  POST_reponame_data,function(){
        lt.it.shouldBeAllowed()
      })


      lt.describe.whenCalledRemotely('GET', '/v1/repos/nathan/girls/1',function(){
        lt.it.shouldBeAllowed()
      })

      lt.describe.whenCalledRemotely('PUT', '/v1/repos/nathan/girls/1',{
        "id": 1,
        "name": "agent1",
        "path": "/nathan/girls/1",
        "location": "agent",
        "ownerId": "2",
        "visibleattrs": "Agenzia Alpha Agent Legs Edited ",
        "filterattrs": "Filtri Agenzia Alpha Legs Edited ",
        "columnwidth": "100",
        "parentid": 2,
        "type": null
      },function(){
        lt.it.shouldBeAllowed()

      })
      lt.describe.whenCalledRemotely('DELETE', '/v1/repos/nathan/girls/1',function(){
          lt.it.shouldBeAllowed()
      })
      lt.describe.whenCalledRemotely('GET', '/v1/repos/nathan/girls/1',function(){
        lt.it.shouldNotBeFound()
      })


})

