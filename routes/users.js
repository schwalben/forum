const express = require('express');
const router = express.Router();
const asociateDefinition = require('../models/asociateDefinition');
const models = asociateDefinition.models;
const Hash = require('../modules/passwordHash');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/register', function(req, res, next) {
  res.render('newUser');
});


router.post('/register', function(req, res, next) {

  const salt = Hash.genSalt(20);
  const hashedInputPassword = Hash.stretchingPassword(req.body.password, salt);
  models.User.create({
    id: req.body.id,
    name: req.body.name,
    password: hashedInputPassword,
    salt: salt
  });
  
  res.redirect('/');
});


module.exports = router;
