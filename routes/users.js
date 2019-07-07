const express = require('express');
const router = express.Router();
const asociateDefinition = require('../models/asociateDefinition');
const models = asociateDefinition.models;
const Hash = require('../modules/passwordHash');


router.get('/register', function(req, res, next) {
  res.render('newUser');
});


router.post('/register', function(req, res, next) {

  const user = {
    id: req.body.id,
    name: req.body.name,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
  };


  const message = isValidUserInput(user);
  if (message) {
    return res.render('newUser', {
      id: user.id,
      name: user.name,
      message: message
    });
  }

  const salt = Hash.genSalt(20);
  const hashedInputPassword = Hash.stretchingPassword(user.password, salt);
  models.User.create({
    id: user.id,
    name: user.name,
    password: hashedInputPassword,
    salt: salt
  });
  
  res.redirect('/');
});


function isValidUserInput(user) {

  if (user.id.length < 4 || user.id.length > 30) {
    return 'ユーザIDは4～30文字で入力してください';
  }

  models.User.findByPk(user.name).then(user => {
    if (!user) {
      return 'このユーザIDは使用済みです';
    }
  });

  if (user.name.length < 4 || user.name.length > 30) {
    return 'ユーザ名は4～30文字で入力してください';
  }

  if (user.password.length < 8 || user.password.length > 30) {
    return 'パスワードは8～30文字で入力してください';
  }

  if (user.password != user.confirmPassword) {
    return  'パスワードは同じ値を入力してください';
  }
  return null;
}


module.exports = router;
