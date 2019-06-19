const express = require('express');
const router = express.Router();
const asociateDefinition = require('../models/asociateDefinition');
const models = asociateDefinition.models;
const Hash = require('../modules/passwordHash');
const loginJWT = require('../modules/loginJWT');


/* GET users listing. */
router.get('/', function(req, res, next) {


  const from = req.query.from;
  if(req.session.user) {
    return res.redirect(from ? from  : '/threads');
  } 

  if (from) {
      res.cookie('loginFrom', from, {expires: new Date(Date.now() + 600000)});
  }

  return res.render('login');

});


// 第一引数は、app.jsで定義したものが規定になる
router.post('/', function(req, res, next) {

  if(req.session.user) {
    return res.redirect('/threads');
  }

  // postの場合、res.body内に贈られた値が入っている。
  // 試してみたが、 ' or 1=1'みたいな入力値はエスケープしてくれる
  models.User.findOne({ where: {
    id: req.body.userId,
    }}).then((user) => {            
      if (!user) {
        return loginFailed(res);
      }
      const hashedInputPassword = Hash.stretchingPassword(req.body.password, user.salt);
      return user.password === hashedInputPassword ? loginSucceeded(req, res, {id: user.id, name: user.name}) : loginFailed(res);
    });
});


function loginFailed(res) {
  res.render('login', {message: 'ユーザID、またはパスワードが誤っています。'});
}

function loginSucceeded(req, res, user) {
  const token = loginJWT.createLoginedToken(user);
  req.session.token = token;
  req.session.user = {id: user.id, name: user.name};

  const loginFrom = req.cookies.loginFrom;
  if (loginFrom &&
    !loginFrom.includes('http://') &&
    !loginFrom.includes('https://')) {
    res.clearCookie('loginFrom');
    res.redirect(loginFrom);
  } else {
    res.redirect('/threads');
  }
}

module.exports = router;