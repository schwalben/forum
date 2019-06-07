const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  return res.redirect('/threads');
});

// 備忘録：↓を忘れるとエラーが発生する。  Router.use() requires a middleware function but got a Object
module.exports = router;