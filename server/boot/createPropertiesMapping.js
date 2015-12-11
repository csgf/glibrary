/**
 * Created by Antonio Di Mariano on 03/12/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */


var path = require('path');
var app = require(path.resolve(__dirname, '../server'));


var User = app.models.user;
var Role = app.models.Role;
var RoleMapping = app.models.RoleMapping;

var repository = app.models['repository'];
module.exports = function(app) {

  PropertiesMap = {}
  RoleMap = {}
  app.RoleMap = RoleMap;

/*
  User.hasMany(RoleMapping, {foreignKey: 'principalId', as: 'mappers'});
  RoleMapping.belongsTo(User, {foreignKey: 'principalId'});
*/
  PropertiesMap['RepoR'] = {
    property: 'getRepository'
  };
  PropertiesMap['RepoW'] = {
    property: 'createCollection'
  };
  PropertiesMap['CollR'] = [
    {
      property: 'getCollection',
    },
    {
      property:' getCollectionSchema'
    }
  ];
  PropertiesMap['CollW'] = [
    {
      property: 'populateCollection'
    },
    {
      property: 'editCollectionBody'
    },
    {
      property: 'deleteCollection'
    }

  ];
  PropertiesMap['ItemR'] = [
    {
      property: 'getCollectionItem'
    },
    {
      property:'getReplicas'
    },
    {
      property:'getReplicaById'
    }
  ];
  PropertiesMap['ItemW'] = [
    {
      property:'deleteCollectionItem'
    },
    {
      property :'editCollectionItem'
    },
    {
      property: 'createReplica'
    },
    {
      property: 'uploadReplicaById',
    },
    {
      property: 'deleteReplicaById'
    }
  ];

  console.log("PropertiesMap['ItemW'] LENGHT",PropertiesMap['ItemR'].length)
  app.PropertiesMap = PropertiesMap;
  console.log("Create: app.PropertiesMap",app.PropertiesMap)
  app.models.Role.find(function(err,roles){

    roles.forEach(function(role) {
        console.log("Role",role.name)
      app.RoleMap[role.name] = { id: role.id }


    })

  })


}

