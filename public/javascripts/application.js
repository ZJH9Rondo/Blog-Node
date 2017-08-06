// 主入口文件
requirejs.config({
    baseUrl: "/javascripts/scripts", // 配置默认访问路径
});

requirejs(['GM','page','upload'],function(GM,page,upload){
  // 获取后台爬取的github数据信息
  // 首页处理数据展示
  (function (){
    var Ajax = GM.ajax(); // 实例化一个Ajax对象

    if(sessionStorage.getItem("github")){ // 设置优先从缓存读取

    }else{
      Ajax.init({
        url: "/github",
        datatype: "json",
        method: "get",
        success: function (data){
          sessionStorage.setItem("github",data);
        }
      });
    }
  })();
});
