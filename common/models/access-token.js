module.exports = function (AccessToken) {
  var app = require('../../server/server.js');
  AccessToken.observe('before save', function (context, final) {
    app.models.user.findOne({where: {"id": context.instance.userId}}, function (e, userdata) {
      context.instance.username = (!userdata.username ? '' : userdata.username )
      context.instance.email = (!userdata.email ? '' : userdata.email);
      final()
    })

  })


};
