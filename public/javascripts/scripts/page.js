// 引入通用方法模块
define(['GM'],function (GM){
  var nav_SlideBar = GM.getDom('#nav_SlideBar'),
      nav_Item = GM.getDom('.nav_Menuitem'),
      getAjax = GM.getDom('#ajax');
  // nav-setting dropdown
  (function (){
      $('.ui .dropdown').dropdown();
  })();

  // nav slideBar
  (function (){
      var offset, // SlideBar 运动距离
          start,  // SlideBar 起始位置
          end,
          timer;

      function slideBar(i){
              GM.addEventHandler(nav_Item[i],"mouseover",function (){
                  var speed = 0;

                  start = nav_SlideBar.offsetLeft;
                  end = this.offsetLeft;
                  offset = end - start;

                  if(offset == '0'){
                    return;
                  }else{
                    clearInterval(timer);
                    timer = setInterval(function (){

                      if((end - nav_SlideBar.offsetLeft+5) < 0){
                        speed = Math.floor((end - nav_SlideBar.offsetLeft+5)/9);
                      }else{
                        speed = Math.ceil((end - nav_SlideBar.offsetLeft+5)/9);
                      }

                      nav_SlideBar.style.marginLeft = nav_SlideBar.offsetLeft + speed + 'px';
                    },20);
                  }
              });

              GM.addEventHandler(nav_Item[i],"mouseout",function (){
                  var speed = 0;
                  clearInterval(timer);
                  timer = setInterval(function (){

                      speed = Math.floor((0 - nav_SlideBar.offsetLeft + 5)/9);

                      nav_SlideBar.style.marginLeft = nav_SlideBar.offsetLeft + speed + 'px';
                  },20);
              });
          }

      // nav_SlideBar 滑动事件
        for (var i = 0; i < nav_Item.length; i++) {
            slideBar(i);
        }
  })();

  // 获取后台爬取的github数据信息
  // 首页处理数据展示
  (function (){
    var Ajax = GM.ajax(); // 实例化一个Ajax对象

    if(sessionStorage.getItem("github")){ // 设置优先从缓存读取
      console.log(sessionStorage.getItem("github"));
    }else{
      Ajax.init({
        url: "/posts/ajax",
        datatype: "json",
        method: "get",
        success: function (data){
          sessionStorage.setItem("github",data);
        }
      });
    }
  })();
});
