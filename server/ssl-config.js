/**
 * Created by hellbreak on 09/06/15.
 */
var path = require('path'),
    fs = require("fs");


//exports.certificate = fs.readFileSync(path.join(__dirname,'./private/INFNCA.pem')).toString();


exports.privateKey = fs.readFileSync(path.join(__dirname, './private/privatekey.pem')).toString();
exports.certificate = fs.readFileSync(path.join(__dirname, './private/certificate.pem')).toString();
