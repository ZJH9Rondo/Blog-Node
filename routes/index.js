//routes/index.js
module.exports = function(app){
    // 首页请求
    app.get('/',function(req,res,next){
       res.render('index');

    });

    // 设置二级路由
    app.use('/',require('./signup'));

    app.use('/',require('./signin'));

    app.use('/',require('./signout'));

    app.use('/',require('./posts'));

};
