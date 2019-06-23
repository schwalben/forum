const express = require('express');
const router = express.Router();



const jwt = require( 'jsonwebtoken' );
const auth = require('../modules/sessionAuthentication');

const urlParser = require('../modules/urlParser');

const fileUploader = require('../modules/fileUploader');
const upload = fileUploader.upload;


const asociateDefinition = require('../models/asociateDefinition');
const models = asociateDefinition.models;
const sequelize = asociateDefinition.sequelize
const url = require('url');

const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

const timeFormatter = require('../modules/timeFormatter');


router.post('/*', function(req, res, next) {  
  const token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('/login?from=' + req.originalUrl);
  }
  next();
});

router.get('/:postId/edit', function(req, res, next) {
  const token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('/login?from=' + req.originalUrl);
  }
  next();
});




/* GET home page. */
router.get('/', csrfProtection, function(req, res, next) {  
  const threadId = urlParser.getThreadId(req.originalUrl);
  const sessionUser = req.session.user
  const userId = sessionUser ? jwt.decode(req.session.token).id : null;

  models.Post.findAll({
    where: {
      threadId: threadId
    }, 
    order: [
      ['createdAt', 'ASC']
    ], 
    include: [
    {
      model: models.User, 
      required: false
    }, {
      model: models.Favorite,
      required: false,
      where: {userId: userId}
    }
  ]
  }).then((posts) => {
    posts.forEach(post => {
      post.formattedCreatedAt = timeFormatter.toStrJST(post.createdAt);
      // Pugの機能でエスケープしたいため、行ごとに配列にしてしまう
      post.lines = post.content ? post.content.split(/\r\n|\r|\n/) : [''];
    });

    return res.render('posts', {
        posts: posts,
        user: sessionUser,
        threadId: threadId,
        csrfToken: req.csrfToken()
    });
  });
});

router.get('/search', csrfProtection, function(req, res) {
  const threadId = urlParser.getThreadId(req.originalUrl);
  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;
  
  const sessionUser = req.session.user
  const userId = sessionUser ? jwt.decode(req.session.token).id : null;

  if (!query.searchCondition) {
    return res.redirect('./');
  }

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
      model: models.User, 
      required: false
    }, {
      model: models.Favorite,
      required: false,
      where: {userId: userId}
    }]
  }).then((posts) => {
      return res.render('posts', {
        posts: posts,
        user: req.session.user,
        threadId: threadId,
        csrfToken: req.csrfToken(),
        searchCondition: query.searchCondition
      });
  });

});

router.get('/export', csrfProtection, function(req, res) {
  
  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;
  const searchCondition = query.exportCondition;

  const threadId = urlParser.getThreadId(req.originalUrl);

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
    }).then(post => {
      return responseJson(res, post);
    });
  } else {
    models.Post.findAll({
      where: {
        threadId: threadId
      }, 
      order: [
        ['createdAt', 'ASC']
      ]
    }).then(post => {
      return responseJson(res, post);
    });
  }
});

function responseJson(res, object) {
  res.setHeader('Content-disposition', 'attachment; filename=data.json');
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  return res.json(object);  
}


router.get('/:postId/edit', csrfProtection, function(req, res, next) {

  const token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('/login?from=' + req.originalUrl);
  }

  const decoded = jwt.decode(token);

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
      err.status = 403;
      return next(err);
  
    }
  });
});


router.post('/:postId/edit',  upload, csrfProtection, function(req, res, next)  {
  
  const decoded = jwt.decode(req.session.token);
  models.Post.findOne(
    {where: {id: req.params.postId}
  }).then(post => {
    if (!isMine(post.postedBy, decoded.id)) {
      const err = new Error('不正なユーザが更新しようとしました。 userId: ' + decoded.id);
      err.status = 500;
      return next(err);
    }

    const filepath = req.file ? req.file.path.replace('public/', '') : null

    if (filepath) {
      models.Post.update({
        content: req.body.content,
        updatedAt: new Date(),
        filePath: filepath
      }, {
        where: {id: req.params.postId}
      }).then(result => {
        return res.redirect('../');
      });

    } else {
      models.Post.update({
        content: req.body.content,
        updatedAt: new Date()
      }, {
        where: {id: req.params.postId}
      }).then(result => {
        return res.redirect('../');
      });
    }
  });

  
});

router.post('/:postId/delete', csrfProtection, function(req, res, next) {
  
  const decoded = jwt.decode(req.session.token);
  
  models.Post.findOne({
    where: {id: req.params.postId}
  }).then((post) => {

    if (!isMine(post.postedBy, decoded.id)) {
      const err = new Error('指定された投稿がない、あるいは、削除する権限がありません');
      err.status = 403;
      return next(err);
    } 
    sequelize.transaction(t => {
      return models.Favorite.destroy({
        where: {
          postId: post.id
      }
    }, {transaction: t}).then(result => {
        return models.Post.destroy({
          where: {id: post.id}
        }, {transaction: t});
      });
    }).then(result => {
      return res.redirect('../');
    }).catch(err => {
      console.log("err occure");
      next(err);
    });    
  });
    


});


router.post('/',  upload, csrfProtection, function(req, res, next) {
  

  const decoded = jwt.decode(req.session.token);
  const filepath = req.file ? req.file.path.replace('public/', '') : null

  models.Post.create({
    content: req.body.content,
    postedBy: decoded.id,
    threadId: urlParser.getThreadId(req.originalUrl),
    filePath: filepath
  });
  
  return res.redirect(req.originalUrl);




});

function isMine(postedBy, userId) {
  return postedBy === userId;
}



module.exports = router;
