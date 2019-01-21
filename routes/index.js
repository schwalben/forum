var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var Users = require('../models/user');
var jwt = require( 'jsonwebtoken' );
var auth = require('../modules/sessionAuthentication');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('/index');
  Post.findAll().then((posts) => {

    var token = req.session.token;
    console.log('token=' + token);

    if (!auth.isValidToken(token)) {
      return res.render('index', {
        title: 'Express',
        posts: posts,
        user: {name: 'guest'}
      });
    }

    var decoded = jwt.decode(token);
    console.log(decoded);
    


    Users.findOne({where: {id: decoded.id}}).then((user) => {
      res.render('index', {
        title: 'Express',
        posts: posts,
        user: user
      });
    });
  });
});


router.get('/:postId/edit', function(req, res, next) {
  console.log('/:postId/edit');
  var token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('../login');
  }
  console.log('validToken');
  var decoded = jwt.decode(token);
  console.log('postId' + req.params.id);
  console.log(req.params);  
  Post.findOne({
    where: {id: req.params.postId}
  }).then((post) => {
    if (isMine(post.postedBy, decoded.id)) {
      return  res.render('postEdit', {
                post: post,
                userId: decoded.id
      });
    }
    const err = new Error('指定された投稿がない、あるいは、編集する権限がありません');
    err.status = 404;
    next(err);
  });




});

router.post('/', function(req, res, next) {
  
  var token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('../login');
  }
  var decoded = jwt.decode(token);
  Post.create({
    content: req.body.content,
    postedBy: decoded.id
  });
  res.redirect('/');

});

function isMine(postedBy, userId) {
  return postedBy === userId;
}

module.exports = router;
