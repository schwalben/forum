var express = require('express');
var router = express.Router();

var models = require('../models/asociateDefinition');
var url = require('url');


router.get('/', function(req, res, next) {

    var parsedUrl = url.parse(req.url, true);
    var query = parsedUrl.query;
    console.log(query);

    models.Post.findAll({where: {
        content: {
            $like: '%' + query.searchCondition + '%'
        }
    }}).then((posts) => {
        res.render('searchPosts', {posts: posts});
    });


});

router.get('/thread', function(req, res, next) {
    var parsedUrl = url.parse(req.url, true);
    var query = parsedUrl.query;
    models.Thread.findAll({where: {
        title: {
            $like: '%' + query.searchCondition + '%'
        }
    }}).then((threads) => {
        res.render('thread', {threads: threads});
    });
});



module.exports = router;