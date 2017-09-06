//routes/index.js
module.exports = function(app){
    // 首页请求
    app.get('/',function(req,res,next){
       res.redirect('posts');

    });

    // 跨域处理
    app.use(function(req, res, next){
        res.header('Access-Control-Allow-Origin','*');
        res.header('Access-Control-Allow-Credentials', true);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Methods','PUT,POST,GET,DELETE,OPTIONS');
        res.header('X-Powered-By',' 3.2.1');
        next();
    });

    // 设置二级路由
    app.use('/',require('./signup'));

    app.use('/',require('./signin'));

    app.use('/',require('./signout'));

    app.use('/',require('./posts'));

    app.use('/',require('./upload_qiniu.js'));
};
