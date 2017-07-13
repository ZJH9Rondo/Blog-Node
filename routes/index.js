//routes/index.js
module.exports = function(app){

    app.get('/',function(req,res){
        return res.redirect('/posts'); // 测试 跳转至 posts
    });

    app.use('/signup',require('./signup'));

    app.use('/signin',require('./signin'));

    app.use('/signout',require('./signout'));

    app.use('/posts',require('./posts'));

};
