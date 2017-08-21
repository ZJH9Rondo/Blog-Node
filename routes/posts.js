// version 1.0.0
var express = require('express');
var router = express.Router();
var urllib = require('url');
var iconv = require('iconv-lite');
var PostModel = require('../models/posts');
var Users = require('../models/users');
var CommentModel = require('../models/comments'); // 留言模块

// 权限检查
var checkLogin = require('../middlewares/check').checkLogin;

// 文章页
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

// 用户主页
router.get('/user',function (req,res,next){
  // author 区分用户页和主页
  var author = req.query.author;

  PostModel.getPosts(author).then(function (result) {
      var posts = result;
      PostModel.getCollections(author).then(function (result){
        var collections = result.collections;

         res.render('posts', {
          posts: posts,
          collections: collections
        });
      });
  });
});



// 跳转到用户文章收藏页
router.get('/user/collections',function (req,res,next){
      // 识别当前登录用户
      var author = req.query.author;

      PostModel.getCollections(author).then(function (result){
          var articles = result.collections;
        // 根据返回的用户收藏文章Id
        // 查询对应文章
         PostModel.getCollect(articles).then(function (collections){
            res.render('collections',{
              collections: collections
            });
         });
      });
});

// 收藏文章
router.get('/collect',function (req,res,next){
      // 根据文章Id 识别当前收藏文章
      var author = req.query.author,
          post = req.query.post;

          PostModel.getCollections(author,post).then(function (result){

              return new Promise(function (resolve,reject){
                  var collections = result.collections,
                      flag = false;

                  for(var i in collections){
                    if(post === collections[i]){
                      flag = true;
                      break;
                    }
                  }
                  resolve(flag);
                });
          }).then(function (result){
            if(result){
              Users.adoptCollect(author,post);

              return new Promise(function (resolve,reject){
                 resolve(result);
              });
            }else{
              Users.addCollect(author,post);

              return new Promise(function (resolve,reject){
                 resolve(result);
              });
            }
          }).then(function (result){
             res.status(200).json(result);
             return res.end();
          });
});

// GET /posts/create 发表文章页
router.get('/user/newArticle', checkLogin, function(req, res, next) {
    res.render('create');
});

// POST /posts 发表一篇文章
router.post('/create/submit', checkLogin, function(req, res, next) {
    // 基本信息
    var author = req.query.author;
    var title = req.fields.title;
    var content = req.fields.content;

    // 校验数据合法性
    try {
    if (!title.length) {
      throw new Error('请填写标题');
    }
    if (!content.length) {
      throw new Error('请填写内容');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  // blog _post实体 当前
  var post = {
   author: author,
   title: title,
   content: content,
   pv: 0
 };

 PostModel.create(post)
    .then(function (result) {
      // 此 post 是插入 mongodb 后的值，包含 _id
      post = result.ops[0];
      req.flash('success', '发表成功');
      // 发表成功后跳转到该文章页
      return res.redirect(`/article?postId=${post._id}`); // 必须使用 ``，否则读取不成功
    });
});

// GET /posts/:postId 单独一篇的文章页
router.get('/article', function(req, res, next) {
    var postId = req.query.postId,
        selects = [PostModel.getPostById(postId),// 获取文章信息
        CommentModel.getComments(postId),// 获取该文章所有留言
        PostModel.incPv(postId)];

    if(req.session.user){
      selects.slice(2,1,PostModel.getCollections(req.session.user._id));
    }

    Promise.all(selects).then(function (result) {
          var post = result[0],
              comments = result[1],
              collections;

          if (!post) {
            throw new Error('该文章不存在');
          }

          if(result[2].collections){
            collections = result[2].collections;
          }else{
            collections = [];
          }

          res.render('post', {
            post: post,
            comments: comments,
            collections: collections
          });
        })
        .catch(next);
    });

// GET /posts/:postId/edit 编辑文章页
router.get('/article/edit', checkLogin, function(req, res, next) {
  var postId = req.query.postId,
      author = req.session.user._id;

  // 方法已定义
  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('该文章不存在');
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('权限不足');
      }
      res.render('edit', {
        post: post
      });
    })
    .catch(next);
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/article/edit/finish', checkLogin, function(req, res, next) {
  var postId = req.query.postId;
  var author = req.session.user._id;
  var title = req.fields.title;
  var content = req.fields.content;

  PostModel.updatePostById(postId, author, { title: title, content: content })
  .then(function () {
    req.flash('success', '编辑文章成功');
    // 编辑成功后跳转到上一页
    return res.redirect(`/article?postId=${postId}`); // 注意字符 ``
  })
    .catch(next);
});

// GET /posts/:postId/remove 删除一篇文章
router.get('/article/remove', checkLogin, function(req, res, next) {
  var postId = req.query.postId;
  var author = req.session.user._id;

  PostModel.delPostById(postId, author)
  .then(function () {
    req.flash('success', '删除文章成功');
    // 删除成功后跳转到主页
    return res.redirect('/posts');
    })
    .catch(next);
});

// POST /posts/:postId/comment 创建一条留言
router.post('/article/addComment', checkLogin, function(req, res, next) {
  var author = req.session.user._id;
  var postId = req.query.postId;
  var content = req.fields.content;
  var comment = {
      author: author,
      postId: postId,
      content: content
  };

  CommentModel.create(comment)
    .then(function () {
      req.flash('success', '留言成功');
      // 留言成功后跳转到上一页
      return res.redirect('back');
    })
    .catch(next);
});

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.get('/article/rmComment', checkLogin, function(req, res, next) {
  var commentId = req.query.commentId;
  var author = req.session.user._id;

  CommentModel.delCommentById(commentId, author)
  .then(function () {
    req.flash('success', '删除留言成功');
    // 删除成功后跳转到上一页
    return res.redirect('back');
  })
  .catch(next);
});

module.exports = router;
