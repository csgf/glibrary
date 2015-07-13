/**
 * Created by hellbreak on 10/06/15.
 */

var lt = require('loopback-testing');
var app = require('../server.js');

var repo_name_with_mysqlremote_coll =
{
  "id":1300,
  "ownerId": 2,
  "name": "deroberto",
  "location": "deroberto",
  "path": "/deroberto",
  "import":"false",
  "repo_db": {
    "type":"mongodb"
  },
  "coll_db" : {
    "host":"",
    "port":"",
    "username":"",
    "password":"",
    "database":"",
    "type" : "mongodb",
    "location" : "local",
    "connector":"mongodb"
  }
}




var repo_name_with_postgresqlremote_coll =
{
  "id":998,
  "ownerId": 2,
  "name": "superman",
  "location": "superman",
  "path": "/superman",
  "import":"false",
  "repo_db": {
    "type":"mongodb"
  },
  "coll_db" : {
    "host":"localhost",
    "port":"5432",
    "username":"hellbreak",
    "password":"",
    "database":"bbmanagement",
    "type" : "postgresql",
    "location" : "remote",
    "connector":"postgresql"

  }
}

var repo_name_with_mongoremote_coll =
{
  "id":997,
  "ownerId": 2,
  "name": "spiderman",
  "location": "spiderman",
  "path": "/spiderman",
  "import":"false",
  "repo_db": {
    "type":"mongodb"
  },
  "coll_db" : {
    "host":"localhost",
    "port":"27017",
    "username":"",
    "password":"",
    "database":"repository_test",
    "type" : "mongodb",
    "location" : "remote"
  }
}

var import_collection_msyql =
{
  "id":1,
  "ownerId": 2,
  "name": "posts",
  "location": "posts",
  "path": "/nathan/posts",
  "storage": "local",
  "subrepo": true,
  "import": true,
  "coll_db": {
    "host": "",
    "port": "",
    "username": "",
    "password": "",
    "database": "",
    "type": "mysql",
    "location": "remote",
    "connector": "mysql"
  }
}
var import_collection_postgresql =
{
  "id":1,
  "ownerId": 2,
  "name": "users",
  "location": "users",
  "path": "/superman/users",
  "storage": "local",
  "subrepo": true,
  "import": true,
  "coll_db": {
    "host": "",
    "port": "",
    "username": "",
    "password": "",
    "database": "",
    "type": "postgresql",
    "location": "remote",
    "connector": "postgresql"
  }
}
var import_collection_mongodb =
{
  "id":2,
  "ownerId": 2,
  "name": "structure",
  "location": "structure",
  "path": "/superman/structures",
  "storage": "local",
  "subrepo": true,
  "import": true,
  "coll_db": {
    "host": "localhost",
    "port": "27017",
    "username": "",
    "password": "",
    "database": "testlab",
    "type": "mongodb",
    "location": "remote",
    "connector": "mongodb"
  }
}

var createLocal_collection_mongodb =
{
  "id":3,
  "ownerId": 2,
  "name": "quote",
  "location": "quote",
  "path": "/superman/quotes",
  "storage": "local",
  "subrepo": true,
  "import": false,
  "coll_db": {
    "host": "localhost",
    "port": "27017",
    "username": "",
    "password": "",
    "database": "repository",
    "type": "mongodb",
    "location": "remote",
    "connector": "mongodb"
  }
}
var createLocal_collection_postgresql =
{
  "id":40,
  "ownerId": 2,
  "name": "game",
  "location": "game",
  "path": "/superman/games",
  "storage": "local",
  "subrepo": true,
  "import": false,
  "coll_db": {
    "host": "",
    "port": "",
    "username": "",
    "password": "",
    "database": "",
    "type": "postgresql",
    "location": "remote",
    "connector": "postgresql"
  }
}

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

/*
describe('1) Import Collection from MySQL ',function(){
  lt.beforeEach.withApp(app);
  lt.describe.whenCalledRemotely('POST','/v1/repos/',repo_name_with_mysqlremote_coll,function(){
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', '/v1/repos/nathan', function () {
    lt.it.shouldBeAllowed()
  })

  lt.describe.whenCalledRemotely('POST','/v1/repos/nathan',import_collection_msyql,function(){
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET','/v1/repos/nathan/posts',function() {
    lt.it.shouldBeAllowed()
  })


})
*/
describe('2) Import Collection from postgreSQL ',function(){
  lt.beforeEach.withApp(app);

  lt.describe.whenCalledRemotely('POST','/v1/repos/',repo_name_with_postgresqlremote_coll,function(){
    lt.it.shouldBeAllowed()
  })
  /*
  lt.describe.whenCalledRemotely('GET', '/v1/repos/superman', function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('POST','/v1/repos/superman',import_collection_postgresql,function(){
    lt.it.shouldBeAllowed()
  })

  lt.describe.whenCalledRemotely('POST','/v1/repos/superman',import_collection_mongodb,function(){
    lt.it.shouldBeAllowed()
  })

  lt.describe.whenCalledRemotely('POST','/v1/repos/superman',createLocal_collection_postgresql,function(){
    lt.it.shouldBeAllowed()
  })
  */

})
/*
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

*/
