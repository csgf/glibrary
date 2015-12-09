/**
 * Created by Antonio Di Mariano on 04/12/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */


var path = require('path');
var app = require(path.resolve(__dirname, '../server'));
var async = require('async');

var ACL = app.models.ACL;

/*-- READ repository --*/
var getRepository_body = {
  "model": "repository",
  "property": "getRepository",
  "accessType": "READ",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "getRepository"
}
/*--- Collection ---*/
var createCollection_body = {
  "model": "repository",
  "property": "createCollection",
  "accessType": "EXECUTE",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "createCollection"
}
var getCollection_body = {
  "model": "repository",
  "property": "getCollection",
  "accessType": "READ",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "getCollection"

}
/*-- Collection Items --*/
var populateCollection_body = {
  "model": "repository",
  "property": "populateCollection",
  "accessType": "EXECUTE",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "populateCollection"
}
var getCollectionItem_body = {
  "model": "repository",
  "property": "getCollectionItem",
  "accessType": "READ",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "getCollectionItem"
}



async.parallel([
  function (callback) {
    console.log("Creating getRepository ACL ")

    ACL.create(getRepository_body, function (err, entry) {
      if (err) throw err;
      console.log("ACL created:", entry)
      callback()
    })
  },

  function (callback) {

    console.log("Creating createCollection");
    ACL.create(createCollection_body, function (err, entry) {
      if (err) throw err;
      console.log("ACL created:", entry)
      callback()
    })
  },
  function (callback) {

    console.log("Creating getCollection");
    ACL.create(getCollection_body, function (err, entry) {
      if (err) throw err;
      console.log("ACL created:", entry)
      callback()
    })
  },
  function (callback) {

    console.log("Creating populateCollection");
    ACL.create(populateCollection_body, function (err, entry) {
      if (err) throw err;
      console.log("ACL created:", entry)
      callback()
    })
  },
  function (callback) {

    console.log("Creating getCollectionItem");
    ACL.create(getCollectionItem_body, function (err, entry) {
      if (err) throw err;
      console.log("ACL created:", entry)
      callback()
    })
  }

], function (err) { //This is the final callback
  console.log('ACL created');

});
