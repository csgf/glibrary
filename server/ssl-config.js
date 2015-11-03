/**
 * Created by Antonio Di Mariano on 09/06/15.
 * email:antonio.dimariano@gmail.com
 * https://github.com/antoniodimariano/
 */
var path = require('path'),
    fs = require("fs");


//exports.certificate = fs.readFileSync(path.join(__dirname,'./private/INFNCA.pem')).toString();


exports.privateKey = fs.readFileSync(path.join(__dirname, './private/privatekey.pem')).toString();
exports.certificate = fs.readFileSync(path.join(__dirname, './private/certificate.pem')).toString();
