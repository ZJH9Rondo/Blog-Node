// signin 登录页
var express = require('express');
var router = express.Router();
var scrypt = require('scrypt');
var key = new Buffer('Rondo Blog'); // 用于 scrypt hash加密
var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin 登录页
router.get('/', checkNotLogin, function(req, res, next) {
    res.render('signin');
});

// POST /signin 用户登录
router.post('/', checkNotLogin, function(req, res, next) {

  var name = req.fields.name;
  var password = req.fields.password;
  var pwdFlag = scrypt.hashSync(key,{"N":16,"r":1,"p":1},64,'password').toString('hex');

  UserModel.getUserByName(name)
  .then(function (user) {
    if (!user) {
      req.flash('error', '用户不存在');
      return res.redirect('back');
    }
    // 检查密码是否匹配
    if (pwdFlag !== user.password) {
      req.flash('error', '用户名或密码错误');
      return res.redirect('back');
    }
    req.flash('success', '登录成功');
    // 用户信息写入 session
    delete user.password;
    req.session.user = user;
    // 跳转到主页
    res.redirect('/posts');
  })
  .catch(next);
});

module.exports = router;
