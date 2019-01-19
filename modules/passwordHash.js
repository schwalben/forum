var crypto = require('crypto');
// BCryptがBetter？
var algorithm = 'sha512';


function toHash(str) {
    var hash = crypto.createHash(algorithm);
    hash.update(str);
    return hash.digest('hex');
}


function genSalt(length) {
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);
}


function stretchingPassword(password, salt) {
    var stretchingNum = 100;    
    var saltPassword = salt + password;
    
    for (var i = 0; i < stretchingNum; i++) {
        saltPassword = toHash(saltPassword)    ;
    }
    
    return saltPassword;

}

module.exports = {stretchingPassword, genSalt};