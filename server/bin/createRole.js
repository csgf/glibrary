/**
 * Created by Antonio Di Mariano on 04/12/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
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
  }
], function (err) { //This is the final callback
    console.log('Role created')
});
