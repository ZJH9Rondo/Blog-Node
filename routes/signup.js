var fs = require('fs');
var path = require('path');
var scrypt = require('scrypt');
var express = require('express');
var router = express.Router();
var key = new Buffer('Rondo Blog'); // 用于 scrypt hash加密

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// xss简单字符转换防范
function encodeHTML(str){
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&qout")
    .replace(/'/g,"#39");
}

// GET /signup 注册页
router.get('/signup', checkNotLogin, function(req, res, next) {
  res.render('signup');
});

// POST /signup 用户注册
router.post('/signup', checkNotLogin, function(req, res, next) {
  console.log('MT',req);
  var name = req.fields.name;
  var bio = req.fields.bio;
  var avatar = req.files.avatar.path.split(path.sep).pop();
  var password = req.fields.password;
  var repassword = req.fields.repassword;

  // 校验参数
 try {
   if (!(name.length >= 1 && name.length <= 10)) {
     throw new Error('名字请限制在 1-10 个字符');
   }
   if (!(bio.length >= 1 && bio.length <= 30)) {
     throw new Error('个人简介请限制在 1-30 个字符');
   }
   if (!req.files.avatar.name) {
     throw new Error('缺少头像');
   }
   if (password.length < 6) {
     throw new Error('密码至少 6 个字符');
   }
   if (password !== repassword) {
     throw new Error('两次输入密码不一致');
   }
 } catch (e) {
   // 注册失败，异步删除上传的头像
   fs.unlink(req.files.avatar.path);
   req.flash('error', e.message);
   res.redirect('/signup');
   return;
 }

  // scrypt hash 密码加密
  password = scrypt.hashSync(key,{"N":16,"r":1,"p":1},64,'password').toString('hex'); // tostring 必须，转化为字符串存取

  // 实例化用户信息
  var user = {
    name: encodeHTML(name),
    password: password,
    bio: encodeHTML(bio),
    avatar: avatar
  };

  // 写入数据库
  UserModel.create_new(user)
    .then(function (result) {
      // 此 user 是插入 mongodb 后的值，包含 _id
      user = result.ops[0];
      // 将用户信息存入 session
      delete user.password;
      req.session.user = user;

      var collectItem = {
        author: req.session.user._id,
        collections: []
      };

      UserModel.createCollect(collectItem).then(function (){
        // 写入 flash
        console.log('111');
        req.flash('success', '注册成功');
      });
      // 跳转到首页
      res.redirect('/posts');
      return;
    })
    .catch(function (e) {
      // 注册失败，异步删除上传的头像
      fs.unlink(req.files.avatar.path);
      // 用户名被占用则跳回注册页，而不是错误页
      if (e.message.match('E11000 duplicate key')) {
        req.flash('error', '用户名已被占用');
        res.redirect('/signup');
        return;
      }
      next(e);
    });
});

module.exports = router;
