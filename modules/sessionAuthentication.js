var jwt = require( 'jsonwebtoken' );


function isValidToken(token) {
    if (!token) {
        return false;
    }

    jwt.verify(token, process.env.JWT_SECRET, function( err ){
        if( err ) {
          console.log('不正なトークンです。 token=' + token);
          return false;
        } 
    });
    return true;
}




module.exports = {isValidToken};