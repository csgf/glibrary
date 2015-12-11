/**
 * Created by Antonio Di Mariano on 04/12/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */


/**
 * It creates ACL Rules for gLibrary methods
 *
 *
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

var editCollectionBody_body = {
  "model": "repository",
  "property": "editCollection",
  "accessType": "EXECUTE",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "editCollection"

}

var deleteCollection_body = {
  "model": "repository",
  "property": "deleteCollection",
  "accessType": "EXECUTE",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "deleteCollection"

}

var getReplicas_body = {
  "model": "repository",
  "property": "getReplicas",
  "accessType": "READ",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "getReplicas"

}

var getReplicaById_body = {
  "model": "repository",
  "property": "getReplicaById",
  "accessType": "READ",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "getReplicaById"
}

var getRelation_body = {
  "model": "repository",
  "property": "getRelation",
  "accessType": "READ",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "getRelation"
}

var deleteCollectionItem_body = {
  "model": "repository",
  "property": "deleteCollectionItem",
  "accessType": "EXECUTE",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "deleteCollectionItem"
}

var editCollectionItem_body = {
  "model": "repository",
  "property": "editCollectionItem",
  "accessType": "EXECUTE",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "editCollectionItem"
}

var createReplica_body = {
  "model": "repository",
  "property": "createReplica",
  "accessType": "EXECUTE",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "createReplica"

}

var uploadReplicaById_body = {
  "model": "repository",
  "property": "uploadReplicaById",
  "accessType": "EXECUTE",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "uploadReplicaById"

}

var deleteReplicaById_body = {
  "model": "repository",
  "property": "deleteReplicaById",
  "accessType": "EXECUTE",
  "permission": "ALLOW",
  "principalType": "ROLE",
  "principalId": "deleteReplicaById"
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
  },
  function(callback) {
    console.log("Creating editCollection")
    ACL.create(editCollectionBody_body,function(err,entry){
      console.log("ACL created:",entry)
      callback()
    })
  },
  function(callback) {
    console.log("Creating deleteCollection_body")
    ACL.create(deleteCollection_body,function(err,entry){
      console.log("ACL created:",entry)
      callback()
    })
  },
  function(callback) {
    console.log("Creating getReplicas")
    ACL.create(getReplicas_body,function(err,entry){
      console.log("ACL created:",entry)
      callback()
    })
  },
  function(callback) {
    console.log("Creating getReplicaById")
    ACL.create(getReplicaById_body,function(err,entry){
      console.log("ACL created:",entry)
      callback()
    })
  },
  function(callback){
    console.log("Creating getRelation")
    ACL.create(getRelation_body,function(err,entry){
      console.log("ACL created:",entry)
      callback()
    })
  },
  function(callback) {
    console.log("Creating deleteCollectionItem")
    ACL.create(deleteCollectionItem_body,function(err,entry){
      console.log("ACL created:",entry)
      callback();
    })
  },
  function(callback) {
    console.log("Creating editCollectionItem")
    ACL.create(editCollectionItem_body,function(err,entry){
      console.log("ACL created:",entry)
      callback();
    })
  },
  function(callback) {
    console.log("Creating createReplica")
    ACL.create(createReplica_body,function(err,entry){
      console.log("ACL created:",entry)
      callback();
    })
  },
  function(callback) {
    console.log("Creating uploadReplicaById")
    ACL.create(uploadReplicaById_body,function(err,entry){
      console.log("ACL created:",entry)
      callback();
    })
  },
  function(callback) {
    console.log("Creating deleteReplicaById")
    ACL.create(deleteReplicaById_body,function(err,entry){
      console.log("ACL created:",entry)
      callback();
    })
  }


], function (err) {
  console.log('ACLs created');
  process.exit(0)


});
