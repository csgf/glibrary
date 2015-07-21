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

  var logger = require("../common/helpers/logger");
  app.use(require('morgan',{ "stream": logger.stream }));


}
