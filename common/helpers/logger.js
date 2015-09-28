/**
 * Created by Antonio Di Mariano on 21/07/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
var winston = require('winston');
var path = require('path');

var filename =
  path.join(__dirname, '../../server/logs/glibrary.log');

winston.emitErrs = true;

var logger = new winston.Logger({
  levels: {
    trace: 0,
    input: 1,
    verbose: 2,
    prompt: 3,
    debug: 4,
    info: 5,
    data: 6,
    help: 7,
    warn: 8,
    error: 9
  },
  colors: {
    trace: 'magenta',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    debug: 'blue',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    error: 'red'
  },
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: filename,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, //5MB
      maxFiles: 5,
      colorize: false
    }),
    new winston.transports.Console({
      level: 'error',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding){
    logger.info(message);
  }
};
