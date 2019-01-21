var jwt = require( 'jsonwebtoken' );


function createLoginedToken(user) {
    return jwt.sign(user, 'hoge', {expiresIn: '24h'});
}




module.exports = {createLoginedToken};