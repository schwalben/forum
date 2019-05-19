var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    
    req.session.destroy(function(err) {
        // cannot access session here
    });    

    res.render('login', {message: 'ログアウトしました'});
});
  
module.exports = router;