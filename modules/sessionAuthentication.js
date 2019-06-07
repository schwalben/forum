const jwt = require( 'jsonwebtoken' );


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

function isValidUser(userId, token) {

    if (!isValidToken(token)) {
        return false;
    }

    const tokenUserId = jwt.decode(token).id;
    return userId === tokenUserId;
}




module.exports = {isValidToken, isValidUser};