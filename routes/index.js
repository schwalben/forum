var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var Users = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  Post.findAll().then((posts) => {
    Users.findAll({where: {id: 'admin'}}).then((users) => {
      res.render('index', {
        title: 'Express',
        posts: posts,
        user: users
      });
    });
  });
});

router.post('/', function(req, res, next) {
  
  Post.create({
    content: req.body.content
  });
  res.redirect('/');

});

module.exports = router;
