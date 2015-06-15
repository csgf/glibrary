/**
 * Created by hellbreak on 04/06/15.
 */

var lt = require('loopback-testing');
var assert = require('assert');
var app = require('../server.js');
var Role = app.models.Role;
var principalType_value = 'repositoryOwner';


describe('Define Role:',function() {
  describe('1) repositoryOwner',function() {
    it('should define a role  named repositoryOwner and role.id == 3',function() {
      Role.create({
        name : principalType_value
      },function(err,role){
        assert.equal(role.name,"repositoryOwner");
        assert.equal(role.id,3);
      })
    })
  })
})
describe('/deroberto not found ',function(){
      lt.beforeEach.withApp(app);
      lt.describe.whenCalledRemotely('GET','/api/deroberto____',function(){
        lt.it.shouldNotBeFound()

      })
});

describe('/ is allow ',function(){
  lt.beforeEach.withApp(app);
  lt.describe.whenCalledRemotely('GET','/',function(){
    lt.it.shouldBeAllowed()
  })
});
describe('/deroberto  denied 1 ',function(){
  lt.beforeEach.withApp(app);
  lt.describe.whenCalledRemotely('GET','/api/deroberto',function(){
    lt.it.shouldBeDenied()

  })
});


describe('/deroberto :',function() {
  describe('1) User with permission',function() {
    it('should access ',function() {
      lt.beforeEach.withApp(app);
      app.models.User.login({
        email: 'jane@doe.com',
        password: 'opensesame'
      }, 'user', function(err, token) {
        token = token.toJSON();
        lt.describe.whenCalledRemotely('GET', '/api/deroberto?access_token=' + token.id, token.id, function (err, data) {
          lt.it.shouldBeAllowed()
        })
      })

    })
   })
})

describe('/deroberto :',function() {
  describe('1) User with permission',function() {
    it('should access ',function() {
      lt.beforeEach.withApp(app);
      app.models.User.login({
        email: 'bob@projects.com',
        password: 'opensesame'
      }, 'user', function(err, token) {
        token = token.toJSON();
        lt.describe.whenCalledRemotely('GET', '/api/deroberto?access_token=' + token.id, token.id, function (err, data) {
          lt.it.shouldBeDenied()
        })
      })

    })
  })
})


