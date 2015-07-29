/**
 * Created by Antonio Di Mariano on 30/06/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */

var path = require('path');
var app = require(path.resolve(__dirname, '../server'));
var dbMongo = app.dataSources.mongoDB;

/*
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chacha');
var testSchema = new mongoose.Schema({name: String},{collection:'opere'});
var Test = mongoose.model('Test',testSchema);
Test.find(function(err,name){
  if(err) console.log("ERR",err);
  //console.log("NAME",name);
  var myTest = dbMongo.buildModelFromInstance('Test2',name,{idInjection: true});
  var obj = new myTest(name);
  console.log("---",obj.toObject())
})
*/


var user = {
  name: 'Joe',
  age: 30,
  birthday: new Date(),
  vip: true,
  address: {
    street: '1 Main St',
    city: 'San Jose',
    state: 'CA',
    zipcode: '95131',
    country: 'US'
  },
  friends: ['John', 'Mary'],
  emails: [
    {label: 'work', id: 'x@sample.com'},
    {label: 'home', id: 'x@home.com'}
  ],
  tags: []
};

// Create a model from the user instance
var User = dbMongo.buildModelFromInstance('User', user, {idInjection: true});

// Use the model for CRUD
var obj = new User(user);

console.log(obj.toObject());

User.create(user, function (err, u1) {
  console.log('Created: ', u1.toObject());
 // User.findById(u1.id, function (err, u2) {
  //  console.log('Found: ', u2.toObject());
 // });
});
