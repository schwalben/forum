var express = require('express');
var router = express.Router();



var jwt = require( 'jsonwebtoken' );
var auth = require('../modules/sessionAuthentication');

var urlParser = require('../modules/urlParser');

var fileUploader = require('../modules/fileUploader');
var multer = fileUploader.multer;
var upload = fileUploader.upload;


var asociateDefinition = require('../models/asociateDefinition');
var models = asociateDefinition.models;
var url = require('url');

const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

const moment = require('moment-timezone');

/* GET home page. */
router.get('/', csrfProtection, function(req, res, next) {  
  var threadId = urlParser.getThreadId(req.originalUrl);

  models.Post.findAll({
    where: {
      threadId: threadId
    }, 
    order: [
      ['createdAt', 'ASC']
    ], 
    include: [{
      model: 
        models.User, 
        required: false
    }]
  }).then((posts) => {
    posts.forEach(post => {
      post.formattedCreatedAt = moment(post.createdAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
    });
    var token = req.session.token;

    if (!auth.isValidToken(token)) {
      res.render('posts', {
        posts: posts,
        user: req.session.user,
        threadId: threadId,
        csrfToken: req.csrfToken()
      });
    } else {
      var decoded = jwt.decode(token);
      models.User.findOne({where: {id: decoded.id}}).then((user) => {
        res.render('posts', {
          posts: posts,
          user: user,
          threadId: threadId,
          csrfToken: req.csrfToken()
        });
      });
    }
  });
});

router.get('/search', csrfProtection, function(req, res) {
  var threadId = urlParser.getThreadId(req.originalUrl);

  var parsedUrl = url.parse(req.url, true);
  var query = parsedUrl.query;
  if (query.searchCondition) {
    models.Post.findAll({
      where: {
        threadId: threadId,
        content: {
          $like: '%' + query.searchCondition + '%'
        }
      }, 
      order: [
        ['createdAt', 'ASC']
      ],  
      include: [{
        model: 
          models.User, 
          required: false
      }]
    }).then((posts) => {
      var token = req.session.token;
  
      if (!auth.isValidToken(token)) {
        res.render('posts', {
          posts: posts,
          user: req.session.user,
          threadId: threadId,
          csrfToken: req.csrfToken(),
          searchCondition: query.searchCondition
        });
      } else {
        var decoded = jwt.decode(token);
        models.User.findOne({where: {id: decoded.id}}).then((user) => {
          res.render('posts', {
            posts: posts,
            user: user,
            threadId: threadId,
            csrfToken: req.csrfToken(),
            searchCondition: query.searchCondition
          });
        });
      }
    });

  } else {
    res.redirect('./');
  };


});

router.get('/export', csrfProtection, function(req, res) {
  
  var parsedUrl = url.parse(req.url, true);
  var query = parsedUrl.query;
  var searchCondition = query.exportCondition;

  var threadId = urlParser.getThreadId(req.originalUrl);
  if (searchCondition) {
    models.Post.findAll({
      where: {
        threadId: threadId,
        content: {
          $like: '%' + searchCondition + '%'
        }
      }, 
      order: [
        ['createdAt', 'ASC']
      ]
    }).then((posts) => {
      res.setHeader('Content-disposition', 'attachment; filename=data.json');
      res.setHeader('Content-Type', 'application/json; charset=UTF-8');
      res.send(JSON.stringify(posts));  
    })
  } else {
    models.Post.findAll({
      where: {
        threadId: threadId
      }, 
      order: [
        ['createdAt', 'ASC']
      ]
    }).then((posts) => {
      res.setHeader('Content-disposition', 'attachment; filename=data.json');
      res.setHeader('Content-Type', 'application/json; charset=UTF-8');
      res.send(JSON.stringify(posts));  
    })
  }
});

router.get('/:postId/edit', csrfProtection, function(req, res, next) {

  var token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('/login?from=' + req.originalUrl);
  }

  var decoded = jwt.decode(token);

  models.Post.findOne({
    where: {id: req.params.postId}
  }).then((post) => {
    if (isMine(post.postedBy, decoded.id)) {
      res.render('postEdit', {
                post: post,
                user: req.session.user,
                userId: decoded.id,
                threadId: urlParser.getThreadId(req.originalUrl),
                csrfToken: req.csrfToken()
      });
    } else {
      const err = new Error('指定された投稿がない、あるいは、編集する権限がありません');
      err.status = 500;
      return next(err);
  
    }
  });
});


router.post('/:postId/edit',  csrfProtection, function(req, res, next)  {
  
  var token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('/login?from=' + req.originalUrl);
  }


  var decoded = jwt.decode(token);
  models.Post.findOne(
    {where: {id: req.params.postId}
  }).then(post => {
    if (!isMine(post.postedBy, decoded.id)) {
      const err = new Error('不正なユーザが更新しようとしました。 userId: ' + decoded.id);
      err.status = 500;
      return next(err);
    }

    models.Post.update({
      content: req.body.content,
      updatedAt: new Date()
    }, {where: {id: req.params.postId}});
    res.redirect('../');
  });

  
});

router.post('/:postId/delete', csrfProtection, function(req, res, next) {
  
  var token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('/login?from=' + req.originalUrl);
  }
  var decoded = jwt.decode(token);
  
  models.Post.findOne({
    where: {id: req.params.postId}
  }).then((post) => {
    if (isMine(post.postedBy, decoded.id)) {
      models.Post.destroy({
        where: {id: post.id}
      });
      res.redirect('../');
    } else {
      const err = new Error('指定された投稿がない、あるいは、削除する権限がありません');
      err.status = 404;
      return next(err);
    }
  });
});


router.post('/',  upload, csrfProtection, function(req, res, next) {
  


    var token = req.session.token;
    if (!auth.isValidToken(token)) {
      return res.redirect('/login?from=' + req.originalUrl);
    }
    var decoded = jwt.decode(token);
  
    var filepath = req.file ? req.file.path.replace('public/', '') : null
  
    models.Post.create({
      content: req.body.content,
      postedBy: decoded.id,
      threadId: urlParser.getThreadId(req.originalUrl),
      filePath: filepath
    });
    
    res.redirect(req.originalUrl);




});

function isMine(postedBy, userId) {
  return postedBy === userId;
}



module.exports = router;
