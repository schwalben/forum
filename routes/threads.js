const express = require('express');
const router = express.Router();

const jwt = require( 'jsonwebtoken' );
const auth = require('../modules/sessionAuthentication');

const fileUploader = require('../modules/fileUploader');
const upload = fileUploader.upload;

const asociateDefinition = require('../models/asociateDefinition');
const models = asociateDefinition.models;
const sequelize = asociateDefinition.sequelize;
const url = require('url');
const timeFormatter = require('../modules/timeFormatter');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });


/* GET home page. */
router.get('/', csrfProtection, function(req, res, next) {

  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;

  if (query.searchCondition) {
    models.Thread.findAll({
      where: {
        title: {
          $like: '%' + query.searchCondition + '%'
        }      
      }, 
      order: [
        ['createdAt', 'ASC']
      ]
    }).then((threads) => {
      threads.forEach((thread) => {
        thread.formattedCreatedAt = timeFormatter.toStrJST(thread.createdAt);
      });

      res.render('thread', {
        threads: threads, 
        user: req.session.user,
        csrfToken: req.csrfToken()
      });
    });
  } else {
    models.Thread.findAll({
      order: [
        ['createdAt', 'ASC']
      ]
    }).then(threads => {
      
      threads.forEach((thread) => {
        console.log(thread);
        thread.formattedCreatedAt = timeFormatter.toStrJST(thread.createdAt);;
      });
      res.render('thread', {
        threads: threads, 
        user: req.session.user,
        csrfToken: req.csrfToken()
      });
    });
  }
});





router.get('/new', csrfProtection, function(req, res, next) {
  res.render('newThread', {
    user: req.session.user,
    csrfToken: req.csrfToken()
  });
});

router.post('/new', upload, csrfProtection, function(req, res, next) {

  const token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('/login?from=' + req.originalUrl);
  }
  const decoded = jwt.decode(token);

  const filepath = req.file ? req.file.path.replace('public/', '') : null
    
  sequelize.transaction(t => {
    return models.Thread.create({
      title: req.body.title,
      createdby: decoded.id
    }, {transaction: t}).then(thread => {
      return models.Post.create({
        content: req.body.content,
        postedBy: decoded.id,
        threadId: thread.threadId,
        filePath: filepath
      }, {transaction: t});
    });
  
  }).then(result => {
    res.redirect('/');
  }).catch(err => {
    console.log("err occure");
    next(err);
  });    

});





module.exports = router;
