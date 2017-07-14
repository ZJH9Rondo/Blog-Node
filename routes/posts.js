// version 1.0.0
var express = require('express');
var router = express.Router();
var https = require('https');
var urllib = require('url');
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var PostModel = require('../models/posts');
var Users = require('../models/users');
var CommentModel = require('../models/comments'); // 留言模块
var url = 'https://github.com/ZJH9Rondo';

// 权限检查
var checkLogin = require('../middlewares/check').checkLogin;

// 首页路由
router.get('/posts',function (req,res,next){
  // author 区分用户页和主页
  var author = req.query.author;

  PostModel.getPosts(author).then(function (result) {
      var posts = result;

      if(req.session.user){
        var authorCollected = req.session.user._id;

        PostModel.getCollections(authorCollected).then(function (result){
          var collections = result.collections;

           res.render('posts', {
              posts: posts,
              collections: collections
          });
        });
      }else{
           res.render('posts',{
              posts: posts
          });
      }
  });
});


module.exports = router;
