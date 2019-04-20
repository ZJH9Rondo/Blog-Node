// 连接数据库
// 存储信息
var config = require('config-lite')(__dirname);
var Mongolass = require('mongolass');
var mongolass = new Mongolass();

mongolass.connect(config.mongodb); // 获取mongdodb 信息，连接

var moment = require('moment');
var objectIdToTimestamp = require('objectid-to-timestamp');

// 根据 id 生成创建时间 created_at
 mongolass.plugin('addCreatedAt', {
  afterFind: function (results) {
    results.forEach(function (item) {
      item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
    });
    return results;
  },

  afterFindOne: function (result) {
    if (result) {
      result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
    }
    return result;
  }
});

// 用户 model 实体
exports.User = mongolass.model('User', {
  name: { type: 'string' },
  password: { type: 'string' },
  avatar: { type: 'string' },
  user_url: {type: 'string'},
  repos: [{type: 'object'}],
  description: {type: 'string'},
  bio: { type: 'string' }
});

exports.User.index({ name: 1 }, { unique: true }).exec();// 根据用户名找到用户，用户名全局唯一

// 文章实体
exports.Post = mongolass.model('Post', {
  author: { type: Mongolass.Types.ObjectId }, // 作者ID
  title: { type: 'string' }, // 文章题目
  content: { type: 'string' },  // 文章正文
  pv: { type: 'number' },  // 点击量
  favourite: [{ type: 'string'}], // 点赞用户集
  favourite_count: {type: 'number'} // 点赞总量
});

exports.Post.index({ author: 1, _id: -1 }).exec();// 按创建时间降序查看用户的文章列表

// 文章收藏模块
exports.Collects = mongolass.model('Collects',{
    author: {type: Mongolass.Types.ObjectId},
    collections: [{type: "string"}]
});

exports.Collects.index({author: 1}).exec(); // 用户名唯一

// 留言功能模块
exports.Comment = mongolass.model('Comment', {
  author: { type: Mongolass.Types.ObjectId },
  content: { type: 'string' },
  postId: { type: Mongolass.Types.ObjectId }
});
exports.Comment.index({ postId: 1, _id: 1 }).exec();// 通过文章 id 获取该文章下所有留言，按留言创建时间升序
exports.Comment.index({ author: 1, _id: 1 }).exec();// 通过用户 id 和留言 id 删除一个留言
