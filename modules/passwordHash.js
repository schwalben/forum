const crypto = require('crypto');
// BCryptがBetter？
const algorithm = 'sha512';


function toHash(str) {
    const hash = crypto.createHash(algorithm);
    hash.update(str);
    return hash.digest('hex');
}


function genSalt(length) {
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);
}


function stretchingPassword(password, salt) {
    const stretchingNum = 100;    
    const saltPassword = salt + password;
    
    for (const i = 0; i < stretchingNum; i++) {
        saltPassword = toHash(saltPassword)    ;
    }
    
    return saltPassword;

}

module.exports = {stretchingPassword, genSalt};