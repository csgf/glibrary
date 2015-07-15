var bodyParser = require('body-parser');
var boot = require('loopback-boot');
var loopback = require('loopback');
var path = require('path');

var app = module.exports = loopback();


var https = require('https');
var fs = require('fs');

var options = {
  cert: fs.readFileSync(path.join(__dirname, './private/certificate.pem'))
};

var ds = loopback.createDataSource({
  connector: require('loopback-component-storage'),
  provider: 'openstack',
  username: 'acaland',
  password: 'demo2015',
  authUrl: 'https://stack-server-01.ct.infn.it:35357'
});
var container = ds.createModel('container');
app.model(container);


var limitQuery = function(req,res,next) {
  if( ! req.query.filter ) {
    console.log("set query limit to 10 records");
    req.query.filter = {limit : 10 };
    next();
  } else next();
}

app.middleware('initial', bodyParser.urlencoded({ extended: true }));
app.middleware('parse', limitQuery);

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname);

app.set('view engine', 'ejs'); // LoopBack comes with EJS out-of-box
app.set('json spaces', 2); // format json responses for easier viewing

// must be set to serve views properly when starting the app via `slc run` from
// the project root
app.set('views', path.resolve(__dirname, 'views'));

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started',options);
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
