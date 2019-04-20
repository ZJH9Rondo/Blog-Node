// 连接文章模型
var marked = require('marked'); //markdown 中间件，支持markdown语法
var Post = require('../lib/mongo').Post;
var Collects = require('../lib/mongo').Collects; // 文章收藏模块

var CommentModel = require('./comments');

marked.setOptions({
  highlight: function (code) {
      return require('highlightjs').highlightAuto(code).value
  }
})
// 给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount', {
  afterFind: function (posts) {
    return Promise.all(posts.map(function (post) {
      return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
        post.commentsCount = commentsCount;
        return post;
      });
    }));
  },
  afterFindOne: function (post) {
    if (post) {
      return CommentModel.getCommentsCount(post._id).then(function (count) {
        post.commentsCount = count;
        return post;
      });
    }
    return post;
  }
});
// 将 post 的主体 content 从 markdown形式转为 html

Post.plugin('contentToHtml', {
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
  // 创建一篇文章
  create: function create(post) {
    return Post.create(post).exec();
  },

  // 通过文章 id 获取一篇文章
  getPostById: function getPostById(postId) {
    return Post.findOne({ _id: postId }).populate({ path: 'author', model:'User' }).addCreatedAt().addCommentsCount().contentToHtml().exec();
  },

  // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
  // 截取 URL 后的 user_Id 来进行区分
  getPosts: function getPosts(author) {
    var query = {};
    if (author) {
      query.author = author;
    }
    return Post
      .find(query)
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 获取对应的收藏文章
  getCollect: function getCollect(collections){

     return Post
     .find({_id: {$in: collections}})
     .populate({ path: 'author', model:'User'})
     .addCreatedAt()
     .addCommentsCount()
     .contentToHtml()
     .exec();
  },

  // 获取登录用户收藏文章
  getCollections: function getCollections(author){
      var collections = Collects
      .findOne({author: author},{collections: 1,_id: 0})
      .exec();
      return collections;
  },

  // 通过文章 id 给 pv 加 1
  incPv: function incPv(postId) {
    return Post
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec();
  },

  // 文章点赞
  favourite: function favourite(post,user){
    return Post.update({"_id": post},{$addToSet:{"favourite":user}}).exec();
  },

  // 取消点赞
  unfavourite: function unfavourite(post,user){
    return Post.update({"_id": post},{$pull:{"favourite":user}}).exec();
  },

  // 点赞总量+1
  favourite_count: function favourite_count(post,number){
    if(number === 1){
      return Post.update({"_id": post},{$inc: {favourite_count: 1}}).exec();
    }else{
      return Post.update({"_id": post},{$inc: {favourite_count: -1}}).exec();
    }
  },

  // 点赞数量-1


  // 通过文章 id 获取一篇原生文章（编辑文章）
  getRawPostById: function getRawPostById(postId) {
    return Post
        .findOne({ _id: postId })
        .populate({ path: 'author', model:'User'})
        .exec();
   },

   // 通过用户 id 和文章 id 更新一篇文章
   updatePostById: function updatePostById(postId, author, data) {
     return Post
     .update({ author: author, _id: postId }, { $set: data })
     .exec();
   },

   // 通过用户 id 和文章 id 删除一篇文章
   delPostById: function delPostById(postId, author) {
     return Post
          .remove({ author: author, _id: postId })
          .exec()
          .then(function (res) {
          // 文章删除后，再删除该文章下的所有留言
          if (res.result.ok && res.result.n > 0) {
            return CommentModel.delCommentsByPostId(postId);
          }
        });
    }
};
