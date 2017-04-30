// 权限控制路由中间件
// 检查用户状态

module.exports = {
    //未登录
    checkLogin: function checkLOgin(req,res,next) {
      // 通过获取用户 session 检查用户状态
      if(!req.session.user) {
          req.flash('error','未登录');
          return res.redirect('/signin');
      }
      next();
    },

    // 已登录
    checkNotLogin: function (req,res,next) {

      if(req.session.user){
        req.flash('error','已登录');
        return res.redirect('back'); // 返回之前的页面
      }
      next();
    }
  };
