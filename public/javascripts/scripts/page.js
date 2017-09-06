// 引入通用方法模块
define(['GM'],function (GM){
  var collects = document.getElementsByClassName('addcollect');
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

// 文章页面图片弹出层展示
(function (){
  var article = document.getElementsByClassName('article');

  if(article[0]){
    var images = article[0].getElementsByTagName('img');

    // 设置弹出曾展示放大图片
    for(var i = 0;i < images.length; i++){

      images[i].addEventListener('mouseover',function (event){
        event = event || window.event;
        event.stopPropagation();

        this.style.cursor = 'url(./img/mouse.svg),auto';
      },false);

      images[i].addEventListener('mouseout',function (event){
        event = event || window.event;
        event.stopPropagation();

        this.style.cursor = 'default';
      },false);

      images[i].addEventListener('click',function (event){
        event = event || window.event;

        event.stopPropagation();
        var cover = document.createElement('div'),
            body = document.getElementsByTagName('body'),
            img = document.createElement('img'),
            src = this.getAttribute('src');

        cover.className = 'ui dimmer modals page transition visible active';
        img.src = src;
        img.className = 'modal_img';
        cover.addEventListener('click',function (event){
          event = event || window.event;

          event.stopPropagation();
          cover.className = 'ui dimmer modals page transition visible';
          body[0].removeChild(cover);
        });
        cover.appendChild(img);
        body[0].appendChild(cover);
      },false);
    }
  }
})();

// 文章点赞事件
(function (){
    var favourites = document.getElementsByClassName('favourite'),
        Ajax = GM.ajax();

    if(favourites.length === 0){
      return;
    }else{
      for(var i=0;i < favourites.length; i++){
        favourites[i].addEventListener('click',function (event){
          event = event || window.event;

          event.stopPropagation();
          var data = {
            "user": this.getAttribute('user'),
            "post": this.getAttribute('post')
          },
          that = this;

          Ajax.init({
            url:'/favourite',
            method: 'get',
            datatype: 'JSON',
            data: data,
            success: function (result){
              result = JSON.parse(result);

              if(result.favourite === 'failed'){
                that.childNodes[0].className = 'thumbs outline up red icon';
              }else{
                that.childNodes[0].className = 'thumbs outline up icon';
              }
              that.childNodes[1].innerText = parseFloat(that.childNodes[1].innerText) + result.count;
            }
          });
        },false);
      }
    }
})();

// 收藏文章事件
(function (){
  var Ajax = GM.ajax();

  for(var i = 0;i < collects.length ; i++){
      collects[i].addEventListener('click',function (event){
          // 组织默认事件和冒泡
          window.event ? window.event.cancelBubble = true : event.stopPropagation();
          var data = {
            "author": this.getAttribute('author'),
            "post": this.getAttribute('post')
            },
            frontCollect;

          collect_status = this.childNodes[0];
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
                collect_status.innerText = '收藏';
              }else{
                collect_status.innerText = '已收藏';
              }
            }
          });

        },false);
      }
    })();
});
