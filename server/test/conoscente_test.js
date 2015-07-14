/**
 * Created by hellbreak on 14/07/15.
 */
var lt = require('loopback-testing');
var app = require('../server.js');

/**
 json da passare alla POST /v1/repos/ per creare il repository
 Viene specificato un datasource remoto che sostituirà quello di sistema datasource.json
 */
var repoName =
{
  "ownerId": 2,
  "name": "amga",
  "location": "amga",
  "path": "/amga",
  "import": "false",
  "repo_db": {
    "type": "mongodb"
  },
  "coll_db": {
    "host": "giular.trigrid.it",
    "port": 3306,
    "username": "root",
    "password": "Grid_db10",
    "database": "dboe_test_daily",
    "type": "mysql",
    "connector": "mysql",
    "location": "remote"
  }
}

var collection =
{
  "name": "pippo4",
  "ownerId": 2,
  "location": "pippo4",
  "path": "/amga/pippo4",
  "storage": "remote",
  "import": false,
  "coll_db": {
    "host": "",
    "port": "",
    "username": "",
    "password": "",
    "database": "dboe_test_daily",
    "type": "mysql",
    "location": "remote",
    "connector": "mysql"
  }
}
describe('Import Collection from Austria  ', function () {
  lt.beforeEach.withApp(app);
  lt.describe.whenCalledRemotely('POST', '/v1/repos/amga', collection, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', '/v1/repos/amga/pippo4', repoName, function () {
    lt.it.shouldBeAllowed()
  })
})
