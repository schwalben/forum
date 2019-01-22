var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  return res.redirect('posts');
});

// 備忘録：↓を忘れるとエラーが発生する。  Router.use() requires a middleware function but got a Object
module.exports = router;