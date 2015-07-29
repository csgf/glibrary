module.exports = function(app) {
  var router = app.loopback.Router();

  router.get('/', function(req, res) {
    res.render('repo_index', {
      loginFailed: false
    });
  });

  router.get('/projects', function(req, res) {
    res.render('projects');
  });
  router.post('/projects', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    console.log("PROJECT:",req.body);
    app.models.User.login({
      email: email,
      password: password
    }, 'user', function(err, token) {
      if (err)
        return res.render('index', {
          email: email,
          password: password,
          loginFailed: true
        });

      token = token.toJSON();
      //console.log("TOKEN:",token);

      res.render('projects', {
        username: token.user.username,
        accessToken: token.id
      });
    });
  });
  router.post('/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    console.log("REQ BODY",req.body);


    app.models.User.login({
      email: email,
      password: password
    }, 'user', function(err, token) {
      if (err) {
      console.log("ERRORE LOGIN",req.body);
        return res.render('index', {
          email: email,
          password: password,
          loginFailed: true
        });
      }
      token = token.toJSON();
      res.render('repositories', {
        username: token.user.username,
        userId : token.user.id,
        accessToken: token.id
      });
    });
  });
  router.get('/logout', function(req, res) {
    var AccessToken = app.models.AccessToken;
    var token = new AccessToken({id: req.query.access_token});
    token.destroy();
    res.redirect('/');
  });
  app.use(router);
};
