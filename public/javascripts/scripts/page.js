// 引入通用方法模块
define(['GM'],function (GM){
  var collect = GM.getDom('.addcollect');
  // nav-setting dropdown
  (function (){
      // create sidebar and attach to menu open
      $('.ui.sidebar').sidebar('attach events', '.toc.item');
      // fix menu when passed
      $('.masthead')
        .visibility({
          once: false,
          onBottomPassed: function() {
            $('.fixed.menu').transition('fade in');
          },
          onBottomPassedReverse: function() {
            $('.fixed.menu').transition('fade out');
          }
        });
      // show dropdown on hover
      $('.ui.dropdown').dropdown({on:'hover'});
      // show accordion
      $('.ui.accordion').accordion();
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
