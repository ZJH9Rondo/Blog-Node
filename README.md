# Blog-Node

## 基于Node的博客系统

### 主要页面
> 这里页面因为个人实在是不会设计，也不是很爱折腾页面布局，所以使用了semantic-ui，布局如果您要使用，可以根据您个人的需求进行重构或者更改。

  ![index](https://github.com/ZJH9Rondo/Blog-Node/blob/master/public/ReadMeIMG/index.png)

  ![mobile_index](https://github.com/ZJH9Rondo/Blog-Node/blob/master/public/ReadMeIMG/mobile_index.png)

  ![pc_article](https://github.com/ZJH9Rondo/Blog-Node/blob/master/public/ReadMeIMG/article.png)

  ![pc_article2](https://github.com/ZJH9Rondo/Blog-Node/blob/master/public/ReadMeIMG/article2.png)

  ![pc_article3](https://github.com/ZJH9Rondo/Blog-Node/blob/master/public/ReadMeIMG/article3.png)

  ![pc_article4](https://github.com/ZJH9Rondo/Blog-Node/blob/master/public/ReadMeIMG/article4.png)

  ![mobile_article](https://github.com/ZJH9Rondo/Blog-Node/blob/master/public/ReadMeIMG/mobile_article.png)

  ![mobile_article2](https://github.com/ZJH9Rondo/Blog-Node/blob/master/public/ReadMeIMG/mobile_article2.png)

  ![mobile_article3](https://github.com/ZJH9Rondo/Blog-Node/blob/master/public/ReadMeIMG/mobile_article3.png)

  ![mobile_article4](https://github.com/ZJH9Rondo/Blog-Node/blob/master/public/ReadMeIMG/mobile_article4.png)

  ![mobile_signin](https://github.com/ZJH9Rondo/Blog-Node/blob/master/public/ReadMeIMG/mobile_signin.png)

### 如何使用
  * 将当前项目文件克隆至本地
  ```js
    git clone git@github.com:ZJH9Rondo/Blog-Node.git
  ```
  * 在/Blog目录下执行
  ```js
    npm install -g
  ```
  * 根据下文模块开发介绍，配置第三方认证及上传七牛图床所需配置文件，还有本地Mongodb的安装及配置
  * 执行下述命令前，默认您已满足前述所有条件
  ```js
    node ./bin/www
  ```
  * 当人如果更改样式表及js，在/Blog目录下终端运行
  ```js
    gulp
  ```

### 功能模块
  * 1.支持Github第三方认证登录
  * 2.调取Github官方Api接口，获取用户responsities信息并展示，提供访问用户Github主页Floow按钮
  * 3.支持本地用户注册个人账号登录
  * 4.支持用户收藏文章与用户个人文章收藏集的管理
  * 5.支持用户个人页面文章管理
  * 6.支持用户对文章点赞功能并点赞计数
  * 7.支持文章图片上传至七牛云并返回Markdown格式插入文本
  * 8.支持编辑文章期间针对不同浏览器支持程度加入对图片的复制粘贴上传和拖拽图片上传
  * 9.支持简单的响应式页面
  * 10.支持用户留言评论及对留言的管理功能（暂时不支持对留言的回复功能）
  * 11.对用户输入做了简单的xss防御转换处理

### 模块开发介绍
  * [第三方认证登陆实现](https://github.com/ZJH9Rondo/Blog-Node/wiki/Github%E7%AC%AC%E4%B8%89%E6%96%B9%E8%AE%A4%E8%AF%81%E7%99%BB%E5%BD%95%E5%AE%9E%E7%8E%B0Github)

  * [Github第三方Api接口调用](https://github.com/ZJH9Rondo/Blog-Node/wiki/%E5%85%B3%E4%BA%8EGithub%E5%AE%98%E6%96%B9Api%E6%8E%A5%E5%8F%A3%E8%B0%83%E7%94%A8)

  * [文章图片管理](https://github.com/ZJH9Rondo/Blog-Node/wiki/%E6%96%87%E7%AB%A0%E5%9B%BE%E7%89%87%E7%AE%A1%E7%90%86)

  * [用户个人文章页面](https://github.com/ZJH9Rondo/Blog-Node/wiki/%E7%94%A8%E6%88%B7%E4%B8%AA%E4%BA%BA%E6%96%87%E7%AB%A0%E9%A1%B5%E9%9D%A2)

  * [用户收藏文章与个人文章收藏集管理实现](https://github.com/ZJH9Rondo/Blog-Node/wiki/用户收藏文章与个人文章收藏集管理实现)

  * [用户文章点赞功能实现](https://github.com/ZJH9Rondo/Blog-Node/wiki/%E7%94%A8%E6%88%B7%E6%96%87%E7%AB%A0%E7%82%B9%E8%B5%9E%E5%8A%9F%E8%83%BD%E5%AE%9E%E7%8E%B0)

  * [用户本地注册及登录实现](https://github.com/ZJH9Rondo/Blog-Node/wiki/用户本地注册及登录实现)

  * [用户留言功能](https://github.com/ZJH9Rondo/Blog-Node/wiki/用户留言功能)

  * [粘贴和拖拽上传图片](https://github.com/ZJH9Rondo/Blog-Node/wiki/%E7%B2%98%E8%B4%B4%E5%92%8C%E6%8B%96%E6%8B%BD%E4%B8%8A%E4%BC%A0%E5%9B%BE%E7%89%87)
