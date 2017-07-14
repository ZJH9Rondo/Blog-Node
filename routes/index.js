//routes/index.js
module.exports = function(app){

    app.get('/',function(req,res,next){
       res.render('index');
    });

    app.use('/',require('./signup'));

    app.use('/',require('./signin'));

    app.use('/',require('./signout'));

    app.use('/',require('./posts'));

};
