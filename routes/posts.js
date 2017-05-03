// version 1.0.0
var express = require('express');
var router = express.Router();
var PostModel = require('../models/posts');

// 权限检查
var checkLogin = require('../middlewares/check').checkLogin;

// GET /posts 所有用户或特定用户的文章页
//  eg: GET /posts?author=xxx

router.get('/',function (req,res,next){
  var author = req.query.author;

  PostModel.getPosts(author).then(function (posts) {
      res.render('posts', {
        posts: posts
    });
  })
  .catch(next);
});

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function(req, res, next) {
    res.render('create');
});

// POST /posts 发表一篇文章
router.post('/', checkLogin, function(req, res, next) {
    // 基本信息
    var author = req.session.user._id;
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

  // mongdodb 实体 当前
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
      res.redirect('/posts/${post._id}');
    })
    .catch(next);
});

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function(req, res, next) {
  res.send(req.flash());
});

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function(req, res, next) {
  res.send(req.flash());
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function(req, res, next) {
  res.send(req.flash());
});

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function(req, res, next) {
  res.send(req.flash());
});

// POST /posts/:postId/comment 创建一条留言
router.post('/:postId/comment', checkLogin, function(req, res, next) {
  res.send(req.flash());
});

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.get('/:postId/comment/:commentId/remove', checkLogin, function(req, res, next) {
  res.send(req.flash());
});

module.exports = router;
