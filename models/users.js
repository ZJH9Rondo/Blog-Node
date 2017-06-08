// 处理用户注册路由
var User = require('../lib/mongo').User;
var Post = require('../lib/mongo').Post;

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
    create: function create(user){
      return User.create(user).exec();
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
        return User
        .update({_id:author},{$push:{collections: post}})
        .exec();
    },

    // 获取登录用户收藏文章
    getCollections: function (author){

        return  User
        .findOne({_id: author},{collections: 1,_id: 0})
        .exec();
    }
};
