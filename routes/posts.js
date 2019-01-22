var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var Users = require('../models/user');
var jwt = require( 'jsonwebtoken' );
var auth = require('../modules/sessionAuthentication');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('/posts');
  Post.findAll().then((posts) => {

    var token = req.session.token;
    console.log('token=' + token);

    if (!auth.isValidToken(token)) {
      return res.render('posts', {
        title: 'Express',
        posts: posts,
        user: {name: 'guest'}
      });
    }

    var decoded = jwt.decode(token);
    console.log(decoded);
    


    Users.findOne({where: {id: decoded.id}}).then((user) => {
      res.render('posts', {
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
    return res.redirect('../../login');
  }
  console.log('validToken');
  var decoded = jwt.decode(token);
  // 
  console.log('postId' + req.params.id);
  console.log(req.params);  
  console.log(req.params.post);
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

router.post('/:postId',  function(req, res, next)  {

  console.log('/:postId/?edit=1');
  console.log(req.params);
  
  var token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('../login');
  }
  console.log('validToken');
  var post = {postId: req.params.postId,
              content: req.body.content
            };

  var decoded = jwt.decode(token);
  if (parseInt(req.query.edit) === 1) {
    updatePostIfMine(post, decoded.id);

    res.redirect('/');
  }
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

function updatePostIfMine(post, userId) {

  Post.findOne(
    {where: {id: post.postId}
  }).then(fetchedPost => {
    if (!isMine(fetchedPost.postedBy, userId)) {
      // TODO:404は不適だと思うので後で再考
      const err = new Error('不正なユーザが更新しようとしました。 userId: ' + userId);
      err.status = 404;
      return next(err);
    }

    Post.update({
      content: post.content
    }, {where: {id: post.postId}});
  });

}

module.exports = router;
