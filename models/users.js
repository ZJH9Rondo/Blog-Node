// 处理用户注册路由
var User = require('../lib/mongo').User;
var Post = require('../lib/mongo').Post;
var Collects = require('../lib/mongo').Collects;

User.plugin('contentToHtml', {
  afterFind: function (posts) {
    return posts.map(function (post) {
      post.content = marked(post.content);
      return post;
    });
  },
  afterFindOne: function (post) {
    if (post) {
      post.content = marked(post.content);
    }
    return post;
  }
});

module.exports = {
    // 注册一个用户
    create_new: function create_new(user){
      return User.create(user).exec();
    },

    createCollect: function createCollect(collectItem){
      return Collects.create(collectItem).exec();
    },

    // 通过用户名获取用户信息
    getUserByName: function getUserByName(name){
      return User
      .findOne({name:name})
      .addCreatedAt()
      .exec();
    },

    // 添加收藏
    addCollect: function addCollect(author,post){
        // 更新当前登录用户收藏文章数据
        return Collects
        .update({"author": author},{$addToSet: {"collections": post}}) // 避免插入重复地址
        .exec();
    },

    // 取消收藏
    adoptCollect: function adoptCollect(author,post){
        // 取消当前已收藏的文章
        return Collects
        .update({"author": author},{$pull: {"collections": post}})  // 移除指定元素
        .exec();
    }
};
