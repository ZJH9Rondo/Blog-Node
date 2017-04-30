// config-lite 机制
// 根据环境变量 NODE_DEV 加载配置文件
// 否则加载默认 default.js 默认配置

module.exports = {
    port: 3000,
    session: {
      secret: 'testBlog',
      key: 'testBlog',
      maxAge: 2592000000
    },
    db: 'testBlog',
    mongodb: 'mongodb://localhost:27017/testBlog'
}; 
