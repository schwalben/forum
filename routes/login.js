var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login');
});


// 第一引数は、app.jsで定義したものが規定になる
router.post('/', function(req, res, next) {
    // postの場合、res.body内に贈られた値が入っている。
    res.send(req.body.userId);
});

// ↓の処理は慣れてきたら消す
// 例えば、↓は/login/test が指定されたときに呼ばれる
router.post('/test', function(req, res, next) {
    // postの場合、res.body内に贈られた値が入っている。
    res.send(req.body.userId2);
});

module.exports = router;