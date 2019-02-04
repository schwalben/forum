var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var url = require('url');


router.get('/', function(req, res, next) {

    var urlPasrts = url.parse(req.url, true);
    var query = urlPasrts.query;
    console.log(query);
    Post.findAll({
        where: {
            content: {
                $like: '%' + query.searchCondition + '%'
            }
        }
    }).then((posts) => {
        res.render('searchPosts', {posts: posts});
    });


});


module.exports = router;