# Blog-Node

## 基于Node的博客系统

###  功能模块

  * 开发环境: ubuntu 16.04
  * Web框架: Express 4
  * 会话机制: express-session
  * 存储session: connect-mongo
  * 通知提示中间件: connect-flash
  * 模板引擎: jade
  * 表单及图片上传中间件: express-formidable
  * 配置文件读取: config-lite
  * markdown解析中间件: marked
  * 时间格式化: moment
  * mongodb驱动: mongolass
  * 根据ObojectId生成时间戳: Obojectid-to-timestamp
  * md5加密: scrypt
  * 日志: winston
  * Express日志中间件: express-windston
  * gitignore过滤文件
  * 配置基本测试: mocha 和 supertest
  * 基于 stylus 进行css的预编译
  * gulp构建自动化
  * requirejs模块化加载

###改动
  * 通过在github看了一些关于在Express中通过scrypt对注册密码进行hash加密的使用,对原本项目中的加密方法进行了更改
  * 开源项目的模板是模板引擎是基于ejs，但是在此项目是基于jade模板引擎，对于其中的模板变量需要更改为jade的语法，详见jade模板指南
  * 加入article单独文章页面，基于stylus预编译对views的css进行了重构，其中有一个stylus的纯方法文件，作为依赖@import到各个所需的styl预编译文件中
  * 配置gulp,在gulp中配置了对.styl后缀的预编译文件进行预编译并将导出的css文件压缩
  * 修改nav的跳转路径,防止在非首页页面时,受路由影响出现跳转错误
  * 博客基于AMD规范，模块化加载js文件,详见问题归纳4

### 问题归纳:
  * 1.在从数据库读取博文Content时，默认jade引擎读取文本为html字符串？
    > 问题描述： 由于在上传文章时，用插件将markdown转变成了html，在从数据库读取的时候，由于默认模板引擎用的是jade，所以导致读取后显示在文本中的是包含标签的字符串

    > 解决: 由于使用了 #{post.content} 传入数据，读取直接包含了标签信息。将变量读取从
    > #{post.content} 更改为 ！=post.content 即可正常

  * 2.在留言功能的页面改动时，需要仔细写jade文件，否则会出现很多错误导致页面无法正常读取值，无法正常显示。

  * 3.测试用例只包含很少一部分，做了少量注册适用性测试用例，待完善。
  * 4.对于requirejs的使用,使用前需要理解其加载原理，为什么要基于AMD规范异步加载js,相比CMD的同步加载和原始加载方法有什么优势,一开始应该如何规划文件模块。
    * 配置加载路径
        javascripts
          |-scripts
          |   |--GM.js
          |   |--nav.js
          |
          |-application.js
          |-require.js
    * 关于application.js的配置
          
