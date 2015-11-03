
module.exports = function(app) {
  var router = app.loopback.Router();

  router.get('/', function(req, res) {
    res.sendStatus(200);

  });

  app.use(router);
};

