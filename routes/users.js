var express = require('express');
var router = express.Router();
var Users = require('../models/user');
var Hash = require('../modules/passwordHash');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/register', function(req, res, next) {
  res.render('newUser');
});


router.post('/register', function(req, res, next) {

  var salt = Hash.genSalt(20);
  var hashedInputPassword = Hash.stretchingPassword(req.body.password, salt);
  Users.create({
    id: req.body.id,
    name: req.body.name,
    password: hashedInputPassword,
    salt: salt
  });
  
  res.redirect('../index');
});


module.exports = router;
