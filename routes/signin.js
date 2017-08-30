// signin 登录页
var express = require('express');
var router = express.Router();
var request = require('request');
var https = require('https');
var scrypt = require('scrypt');
var key = new Buffer('Rondo Blog'); // 用于 scrypt hash加密
var UserModel = require('../models/users');
var oAuth_github = require('../config/oAuth_github');

var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin 登录页
router.get('/signin', checkNotLogin, function(req, res, next) {
    res.render('signin');
});

// POST /signin 用户登录
router.post('/signin', checkNotLogin, function(req, res, next) {

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
      res.redirect('back');
      return;
    }
    req.flash('success', '登录成功');
    // 用户信息写入 session
    delete user.password;
    req.session.user = user;
    // 跳转到主页
    return res.redirect('/posts');
  })
  .catch(next);
});

// github 第三方登录验证
router.get('/github',function (req,res,next){
  res.header('Content-Type', 'application/json;charset=utf-8');
  res.json(oAuth_github.client_id);
});

// check code and return access_token
router.get('/checkoAuth',function (req,res,next){
    var code = req.query.code;
    var headers = req.headers;
    var options = {
      headers: {"Content-Type": 'application/json'},
      url: 'https://github.com/login/oauth/access_token',
      method: 'POST',
      json: true,
      body:{
        "client_id": oAuth_github.client_id,
        "client_secret": oAuth_github.client_secret,
        "code": code,
        "state": "ZJH9RondoBlog"
      }
    };

    request(options,function (err,response,data){
        if(err){
          throw err;
        }

        if(response.statusCode === 200){
          var options = {
            url: 'https://api.github.com/user?access_token='+ data.access_token,
            headers: {
              'User-Agent': 'Rondo_blog'
            }
          };

          console.log(options.url);
          request.get(options,function (err,response,data){
            if(err){
              throw err;
            }

            if(response.statusCode === 200){
              data = JSON.parse(data);
              data.id = data.id.toString();
              var code_repos = {
                   url: data.repos_url,
                   headers: {
                    'User-Agent': 'Rondo_blog'
                  }
                },
                githuber = {
                  name: data.login,
                  password: data.id,
                  avatar: data.avatar_url,
                  repos: [],
                  bio: data.bio
                };

             request.get(code_repos,function (err,response,data){
               if(err){
                 throw err;
               }

               if(response.statusCode === 200){
                UserModel.check_oAuthUser(data.id).then(function (result){
                  // 防止二次注册

                  if(result.length !== 0){
                    req.flash('success', '用户已存在，直接登录');
                    user = result[0];
                    // 存入session
                    req.session.user = user;
                    res.redirect('/posts');
                  }else{
                    var user_repos = [];

                    data = JSON.parse(data);
                    for(let i=0; i < data.length; i++){
                      if(!data[i].fork){
                        user_repos.push({
                          name: data[i].name,
                          language: data[i].language,
                          star: data[i].stargazers_count
                        });
                      }
                    }

                    githuber.repos = user_repos;
                    UserModel.create_new(githuber).then(function (result){

                      user = result.ops[0];
                      // 将用户信息存入 session
                      req.session.user = user;
                      var collectItem = {
                        author: req.session.user._id,
                        collections: []
                      };

                      UserModel.createCollect(collectItem).then(function (result){
                        // 写入 flash
                        req.flash('success', '注册成功');
                        res.redirect('/posts');
                      });
                    }).catch(function (err){
                      if(err){
                        throw err;
                      }
                    });
                  }
                });
               }
             });
            }
          });
        }
    });
});

module.exports = router;
