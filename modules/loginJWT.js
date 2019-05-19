var jwt = require( 'jsonwebtoken' );


const JWT_SECRET = process.env.JWT_SECRET;

function createLoginedToken(user) {
    return jwt.sign(user, JWT_SECRET, {expiresIn: '24h'});
}




module.exports = {createLoginedToken};