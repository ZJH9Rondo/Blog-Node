// 引入通用方法模块
define(['GM'],function (GM){
  var nav_SlideBar = GM.getDom('#nav_SlideBar'),
      nav_Item = GM.getDom('.nav_Menuitem'),
      collect = GM.getDom('.addcollect');
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
              GM.addEventHandler(nav_Item[i],"mouseover",function (event){
                 var speed = 0;

                 start = nav_SlideBar.offsetLeft;
                 end = this.offsetLeft;
                 offset = end - start;

                 if(offset == '0'){
                   return;
                 }else{
                   clearInterval(timer);
                   timer = setInterval(function (){
                     if((end - nav_SlideBar.offsetLeft) < 0){
                       speed = Math.floor((end - nav_SlideBar.offsetLeft)/9);
                     }else{
                       speed = Math.ceil((end - nav_SlideBar.offsetLeft)/9);
                     }

                     nav_SlideBar.style.marginLeft = nav_SlideBar.offsetLeft + speed + 'px';
                   },20);
                 }
             });

             GM.addEventHandler(nav_Item[i],"mouseout",function (){
                 var speed = 0;
                 clearInterval(timer);
                 timer = setInterval(function (){

                   speed = Math.floor((0 - nav_SlideBar.offsetLeft)/9);

                   nav_SlideBar.style.marginLeft = nav_SlideBar.offsetLeft + speed + 'px';
                 },20);
             });
          }

      // nav_SlideBar 滑动事件
        for (var i = 0; i < nav_Item.length; i++) {
            slideBar(i);
        }
  })();

    // 收藏文章
    // 绑定点击事件
    (function (){
        var Ajax = GM.ajax();

        for(var i = 0;i < collect.length ; i++){
          GM.addEventHandler(collect[i],"click",function (event){
                // 组织默认事件和冒泡
                window.event ? window.event.cancelBubble = true : event.stopPropagation();

                var data = {
                  "author": this.getAttribute('author'),
                  "post": this.getAttribute('post')
                  },
                  frontCollect;

                frontCollect = this.childNodes[0];
                // 收藏文章的ajax请求
                Ajax.init({
                  url: "/collect",
                  datatype: "JSON",
                  data: data,
                  method: "get",
                  success: function (result){
                    result = JSON.parse(result);

                    var flag = result;
                    if(flag){
                      frontCollect.src = '/images/favourite.svg';  // 收藏成功 切换标识
                    }else{
                      frontCollect.src = '/images/collect_success.svg';
                    }
                  }
                });
          });
        }
    })();
});
