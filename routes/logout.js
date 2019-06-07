const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    
    req.session.destroy(function(err) {});

    res.render('login', {message: 'ログアウトしました'});
});
  
module.exports = router;