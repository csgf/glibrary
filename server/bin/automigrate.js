/**
 * Created by Antonio Di Mariano on 25/06/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
var path = require('path');
var app = require(path.resolve(__dirname, '../server'));

var repositories = [
  {
    "id":1,
    "ownerId": 2,
    "name": "montalbano",
    "location": "montalbano",
    "path": "/montalbano",
    "storage": "remote",
    "subrepo": true,
    "host": "localhost",
    "port": "5432",
    "database": "demo",
    "username": "hellbreak",
    "password": "",
    "connector": "postgresql"

  }
];
var dataSource = app.dataSources.repoDB;

dataSource.automigrate('Repository', function(err) {
  if (err) console.log(err);

  var Repository = app.models.Repository;
  var count = repositories.length;

  repositories.forEach(function(repository) {
    Repository.create(repository, function(err, record) {
      if (err) return console.log(err);

      console.log('Record created:', record);

      count--;

      if (count === 0) {
        console.log('done');
        dataSource.disconnect();
      }
    });
  });
});
