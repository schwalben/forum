var express = require('express');
var router = express.Router();
var asociateDefinition = require('../models/asociateDefinition');
var models = asociateDefinition.models;
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
  models.User.create({
    id: req.body.id,
    name: req.body.name,
    password: hashedInputPassword,
    salt: salt
  });
  
  res.redirect('/');
});


module.exports = router;
