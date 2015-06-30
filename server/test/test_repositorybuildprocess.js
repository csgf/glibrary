/**
 * Created by hellbreak on 10/06/15.
 */

var lt = require('loopback-testing');
var app = require('../server.js');


var POST_repos_data =
{
  "id":99,
  "ownerId": 2,
  "name": "nathan",
  "location": "nathan",
  "path": "/nathan",
  "storage": "cloud"
}
var POST_reponame_data = {
  "id":1,
  "ownerId": 2,
  "name": "girls",
  "location": "girls",
  "path": "/nathan/girls",
  "storage": "cloud"
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
      lt.describe.whenCalledRemotely('GET', '/v1/repos/nathan',function(){
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
          "storage": "cloud"
        },function () {
          lt.it.shouldBeAllowed()
        })
      lt.describe.whenCalledRemotely('PUT', '/v1/repos/nathan/girls', {
        "id": 1,
        "name": "agent1",
        "path": "/nathan/girls/1",
        "location": "agent",
        "ownerId": "2",
        "storage" : "testing_cloud_modificato"
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
        "storage": "testing_cloud"
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

