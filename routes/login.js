var express = require('express');
var router = express.Router();
var Users = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login');
});


// 第一引数は、app.jsで定義したものが規定になる
router.post('/', function(req, res, next) {
    // postの場合、res.body内に贈られた値が入っている。
    // TODO: passwordのハッシュ＆ソルト＆ストレッチング
    // 試してみたが、 ' or 1=1'みたいな入力値はエスケープしてくれる
    Users.findAll({ where: {
        id: req.body.userId,
        password: req.body.password
        }}).then((users) => {
            if (users.length != 1) {
                return loginFailed(res);
            }
            return loginSucceeded(res);
    });

});

// ↓の処理は慣れてきたら消す
// 例えば、↓は/login/test が指定されたときに呼ばれる
router.post('/test', function(req, res, next) {
    // postの場合、res.body内に贈られた値が入っている。
    res.send(req.body.userId2);
});


function loginFailed(res) {
    res.render('login', {message: 'LOGIN FAILED'});
}

function loginSucceeded(res) {
    res.render('login', {message: 'LOGIN SUCCESS'});
}

module.exports = router;