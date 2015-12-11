/**
 * Created by Antonio Di Mariano on 04/12/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */


/**
 * It creates Roles to use with ACL system
 *
 */


var path = require('path');
var app = require(path.resolve(__dirname, '../server'));
var async = require('async');
var Role = app.models.Role;

async.parallel([

  function (callback) {
    Role.create({"name": "getRepository"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })

  },
  function (callback) {
    Role.create({"name": "createCollection"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {
    Role.create({"name": "getCollection"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {
    Role.create({"name": "populateCollection"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {
    Role.create({"name": "getCollectionItem"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {
    Role.create({"name": "editCollectionBody"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {
    Role.create({"name": "deleteCollection"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {
    Role.create({"name": "editCollectionItem"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {
    Role.create({"name": "deleteCollectionItem"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {
    Role.create({"name": "getCollectionSchema"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {
    Role.create({"name": "getReplicas"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {
    Role.create({"name": "getReplicaById"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {
    Role.create({"name": "createReplica"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {
    Role.create({"name": "deleteReplicaById"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {
    Role.create({"name": "uploadReplicaById"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  },
  function (callback) {

    Role.create({"name": "getRelation"}, function (err, entry) {
      if (err) throw err;
      console.log("Role created: ", entry)
      callback()
    })
  }

], function (err) {
  console.log('Role created')
  process.exit(0)

});
