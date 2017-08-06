/*
* 获取客户端上传token
*   ZJH9Rondo
*/
var express = require('express');
var router = express.Router();
var qiniu = require('qiniu');
var qiniu_user = require('../config/qiniu_user.js');

// 获取客户端所需token
router.get('/getToken',function (req,res,next){
  var mac = new qiniu.auth.digest.Mac(qiniu_user.ACCESS_Key,qiniu_user.SECRET_Key);

  var putPolicy = new qiniu.rs.PutPolicy(qiniu_user.OPTIONS);
  var uploadToken=putPolicy.uploadToken(mac);

  if(uploadToken){
    res.json({
      'token': uploadToken
    });
  }
});

module.exports = router;
