// 连接数据库
// 存储信息
var config = require('config-lite');
var Mongolass = require('mongolass');
var mongolass = new Mongolass();

mongolass.connect(config.mongodb); // 获取mongdodb 信息，连接

// model 实体
exports.User = mongolass.model('User', {
  name: { type: 'string' },
  password: { type: 'string' },
  avatar: { type: 'string' },
  gender: { type: 'string', enum: ['m', 'f', 'x'] },
  bio: { type: 'string' }
});


exports.User.index({ name: 1 }, { unique: true }).exec();// 根据用户名找到用户，用户名全局唯一
