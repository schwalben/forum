var express = require('express');
var router = express.Router();
var asociateDefinition = require('../models/asociateDefinition');
var models = asociateDefinition.models;
var Hash = require('../modules/passwordHash');
var loginJWT = require('../modules/loginJWT');



/* GET users listing. */
router.get('/', function(req, res, next) {

  const from = req.query.from;
  if(req.session.user) {
    res.redirect(from ? from  : '/threads');
  } else {
    if (from) {
        res.cookie('loginFrom', from, {expires: new Date(Date.now() + 600000)});
    }
    res.render('login');
  }
});


// 第一引数は、app.jsで定義したものが規定になる
router.post('/', function(req, res, next) {

  // postの場合、res.body内に贈られた値が入っている。
  // 試してみたが、 ' or 1=1'みたいな入力値はエスケープしてくれる
  models.User.findOne({ where: {
    id: req.body.userId,
    }}).then((user) => {            
      if (!user) {
        return loginFailed(res);
      }
      var hashedInputPassword = Hash.stretchingPassword(req.body.password, user.salt);
      return user.password === hashedInputPassword ? loginSucceeded(req, res, {id: user.id, name: user.name}) : loginFailed(res);
    });
});


function loginFailed(res) {
  res.render('login', {message: 'ユーザID、またはパスワードが誤っています。'});
}

function loginSucceeded(req, res, user) {
  var token = loginJWT.createLoginedToken(user);
  req.session.token = token;
  req.session.user = {id: user.id, name: user.name};

  var loginFrom = req.cookies.loginFrom;
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