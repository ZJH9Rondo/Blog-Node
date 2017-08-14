// signout 登出
var express = require('express');
var router = express.Router();

var checkLogin = require('../middlewares/check').checkLogin;

// GET /signout 登出
router.get('/signout', checkLogin, function(req, res, next) {

  // 清空 session
  req.session.user = null;
  req.flash('success','登出成功！');

  res.redirect('/posts');
  return;
});

module.exports = router;
