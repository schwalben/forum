var jwt = require( 'jsonwebtoken' );


function isValidToken(inputToken) {
    var token = inputToken;
    if (!token) {
        return false;
    }

    jwt.verify(token, 'hoge', function( err ){
        if( err ) {
          console.log('不正なトークンです');
          return false;
        } 
    });
    return true;
}




module.exports = {isValidToken};