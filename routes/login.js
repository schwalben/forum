var express = require('express');
var router = express.Router();
var Users = require('../models/user');
var Hash = require('../modules/passwordHash');
var jwt = require( 'jsonwebtoken' );


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login');
});


// 第一引数は、app.jsで定義したものが規定になる
router.post('/', function(req, res, next) {

    // TODO: validation

    // postの場合、res.body内に贈られた値が入っている。
    // 試してみたが、 ' or 1=1'みたいな入力値はエスケープしてくれる
    Users.findOne({ where: {
        id: req.body.userId,
        }}).then((user) => {            
            if (!user) {
                return loginFailed(res);
            }
            var hashedInputPassword = Hash.stretchingPassword(req.body.password, user.salt);
            return user.password === hashedInputPassword ? loginSucceeded(req, res, {id: user.id, name: user.name}) : loginFailed(res);
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

function loginSucceeded(req, res, user) {
    var token = jwt.sign(user, 'hoge', {expiresIn: '24h'});
    req.session.token = token;
    console.log(token);
    console.log(user);
    console.log('sessionToken=' + req.session.token);
    res.redirect('../');
}

module.exports = router;