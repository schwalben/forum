var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var Users = require('../models/user');
var jwt = require( 'jsonwebtoken' );

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('index');
  Post.findAll().then((posts) => {

    var token = req.session.token;
    console.log('token=' + token);
    if (!token) {
      return res.render('index', {
        title: 'Express',
        posts: posts,
        user: {name: 'hoge'}
      });
    }
    jwt.verify(token, 'hoge', function( err ){
      if( err ) {
        return res.render('index', {
          title: 'Express',
          posts: posts,
          user: {name: 'hoge'}
        });
      } 
    });

    var decoded = jwt.decode(token);
    console.log(decoded);

    // TODO: findByPKとか出来ないかな？ PK項目で検索してるのにfindAllはわかりにくい
    Users.findOne({where: {id: decoded.id}}).then((user) => {

      res.render('index', {
        title: 'Express',
        posts: posts,
        user: user
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
