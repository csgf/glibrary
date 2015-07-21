/**
 * Created by Antonio Di Mariano on 14/07/15.
 */
var lt = require('loopback-testing');
var app = require('../server.js');

/**
 json da passare alla POST /v1/repos/ per creare il repository
 Viene specificato un datasource remoto che sostituirà quello di sistema datasource.json
 */
/*
 ********************
 *General Information
 ********************
 Server Type: PostgreSQL
 Connection Name: gLibrary
 Host name / IP address: glibrary.ct.infn.it
 Port: 5432
 Default database: metadata
 User name: arda
 Save Password: NO

 ********************
 *Advanced Information
 ********************
 Setting Save Path: /Users/hellbreak/Library/Application Support/Navicat Premium/gLibrary
 Timeout reconnection: NO
 Auto Connect: NO
 Use socket for localhost connection: NO
 Use Advanced Connections: NO

 ********************
 *SSL Information
 ********************
 Use SSL: NO

 ********************
 *SSH Information
 ********************
 Use SSH Tunnel: NO

 ********************
 *HTTP Information
 ********************
 Use HTTP Tunnel: NO

 ********************
 *Other Information
 ********************

 */

var collection =
{
  "name": "dir103",
  "ownerId": 2,
  "location": "dir103",
  "path": "/amga/manuscripts",
  "storage": "remote",
  "import": true,
  "coll_db": {
    "host": "glibrary.ct.infn.it",
    "port": "5432",
    "username": "arda",
    "password": "",
    "database": "metadata",
    "type": "postgresql",
    "location": "remote",
    "connector": "postgresql"
  }
}

describe('Import Collection from Austria  ', function () {
  lt.beforeEach.withApp(app);

  lt.describe.whenCalledRemotely('POST', '/v1/repos/amga', collection, function () {
    lt.it.shouldBeAllowed()
  })
  lt.describe.whenCalledRemotely('GET', '/v1/repos/amga/manuscripts', function () {
    lt.it.shouldBeAllowed()
  })
})
