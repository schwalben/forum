var express = require('express');
var router = express.Router();

var jwt = require( 'jsonwebtoken' );
var auth = require('../modules/sessionAuthentication');

var fileUploader = require('../modules/fileUploader');
var upload = fileUploader.upload;

var asociateDefinition = require('../models/asociateDefinition');
var models = asociateDefinition.models;
var sequelize = asociateDefinition.sequelize;
var url = require('url');
const moment = require('moment-timezone');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });


/* GET home page. */
router.get('/', csrfProtection, function(req, res, next) {

  var parsedUrl = url.parse(req.url, true);
  var query = parsedUrl.query;

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
        thread.formattedCreatedAt = moment(thread.createdAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
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
        thread.formattedCreatedAt = moment(thread.createdAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
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

  var token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('/login?from=' + req.originalUrl);
  }
  var decoded = jwt.decode(token);

  var filepath = req.file ? req.file.path.replace('public/', '') : null
    
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
    console.log("result");
    res.redirect('/');
  }).catch(err => {
    console.log("err occure");
    next(err);
  });    

});





module.exports = router;
