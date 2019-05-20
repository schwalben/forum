var express = require('express');
var router = express.Router();

var jwt = require( 'jsonwebtoken' );
var auth = require('../modules/sessionAuthentication');

var urlParser = require('../modules/urlParser');


var asociateDefinition = require('../models/asociateDefinition');
var models = asociateDefinition.models;
var url = require('url');

const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

const moment = require('moment-timezone');






/* GET home page. */
router.get('/users/:userId', function(req, res, next) {  

  var sessionUser = req.session.user
  var userId = sessionUser ? jwt.decode(req.session.token).id : null;

  if (userId != sessionUser.id) {
      return res.redirect('/logout');
  }

  var paramUserId = req.params.userId;
  if (paramUserId != userId) {
    const err = new Error('覗きは禁止。');
    err.status = 403;
    return next(err);
  }



  models.Favorite.findAll({
    where: {userId: userId},
    order: [
      ['createdAt', 'DESC']
    ], include: [{
      model: models.Post,
      required: true, 
      include: [{
        model: models.User,
        require: false
      }, {
        model: models.Thread,
        required: true
      }]
    }]
  }).then((favorites) => {
    favorites.forEach(favorite => {
      favorite.Post.formattedCreatedAt = moment(favorite.Post.createdAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
      favorite.Post.Thread.formattedCreatedAt = moment(favorite.Post.Thread.createdAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm:ss');
    });
    res.render('favorites', {
      favorites: favorites,
      user: sessionUser
      });
  });

});


router.post('/users/:userId/posts/:postId/resister', function(req, res, next) {  

  var token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('/login?from=' + req.originalUrl);
  }  

  var userId = jwt.decode(token).id;
  var postId = req.params.postId;


  models.Favorite.create({
    postId: postId,
    userId: userId
  }).then(() => {
    res.json({status: 'OK'});
  });
  
});

router.post('/users/:userId/posts/:postId/cancel', function(req, res, next) {
  
  var token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('/login?from=' + req.originalUrl);
  }  

  var userId = jwt.decode(token).id;
  var postId = req.params.postId;

  models.Favorite.destroy({
    where: {
      postId: postId,
      userId: userId
    }
  }).then(() => {
    res.json({status: 'OK'});
  });
  
});


module.exports = router;