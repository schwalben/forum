const express = require('express');
const router = express.Router();

const jwt = require( 'jsonwebtoken' );
const auth = require('../modules/sessionAuthentication');




const asociateDefinition = require('../models/asociateDefinition');
const models = asociateDefinition.models;
const sequelize = asociateDefinition.sequelize;

const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

const moment = require('moment-timezone');






/* GET home page. */
router.get('/users/:userId', function(req, res, next) {  

  const sessionUser = req.session.user
  const userId = sessionUser ? jwt.decode(req.session.token).id : null;

  if (userId != sessionUser.id) {
      return res.redirect('/logout');
  }

  const paramUserId = req.params.userId;
  if (paramUserId != userId) {
    const err = new Error('覗きは禁止。');
    err.status = 403;
    return next(err);
  }



  models.Favorite.findAll({
    attributes: [
      [sequelize.literal('ROW_NUMBER() OVER(PARTITION BY "Post"."threadId" ORDER BY "Post"."createdAt")'), 'rowNum']
    ],
    where: {userId: userId},
    order: [
      [models.Post, 'threadId', 'DESC'],
      [models.Post, 'createdAt', 'ASC']
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
    return res.render('favorites', {
      favorites: favorites,
      user: sessionUser
    });
  });
});


router.post('/users/:userId/posts/:postId/resister', function(req, res, next) {  

  const token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('/login?from=' + req.originalUrl);
  }  

  const userId = jwt.decode(token).id;
  const postId = req.params.postId;


  models.Favorite.create({
    postId: postId,
    userId: userId
  }).then(() => {
    res.json({status: 'OK'});
  });
  
});

router.post('/users/:userId/posts/:postId/cancel', function(req, res, next) {
  
  const token = req.session.token;
  if (!auth.isValidToken(token)) {
    return res.redirect('/login?from=' + req.originalUrl);
  }  

  const userId = jwt.decode(token).id;
  const postId = req.params.postId;

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