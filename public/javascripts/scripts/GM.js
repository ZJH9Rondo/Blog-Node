// global method
define(function(){
    // 封装通用方法
        return {
          // 获取Dom结点
          getDom: function (target){
              var kindDom = target.slice(0,1),
                  item = target.slice(1),
                  Dom;

              switch (kindDom) {
                case '#':  Dom = document.getElementById(item);
                           break;

                case '.':  Dom = document.getElementsByClassName(item);
                           break;

                default:   if(document.getElementsByTagName(target)){
                    Dom = document.getElementsByTagName(target);
                }else{
                    Dom = document.getElementsByName(target);
                }
              }

              return Dom;
          },

          // 绑定事件
          addEventHandler: function (element,type,handler){
              if(element.addEventListener){
                element.addEventListener(type,handler,false);
              }else if(element.attachEvent){
                // IE 事件捕获
                element.attachEvent("on"+type,handler);
              }else{
                element["on" + type] = handler;
              }
          },

          // 移除事件
          removeEventHandler: function (element,type,hanlder){
              if(element.removeEventListener){
                  element.removeEventListener(type,hanlder,false);
              }else if(element.detachEvent){
                  element.detachEvent("on" + type, hanlder);
              }else{
                element["on" + type] = null;
              }
          },

          // 捕获事件对象引用
          getEvent: function (event){
            return  event ? event : window.event;
          },

          // 捕获事件目标
          getTarget: function (event){
            return  event.Target || event.srcElement;
          },

          // 取消默认事件
          preventDefault: function (event){
            if(event.preventDefault){
                event.preventDefault();
            }else{
              // IE
              event.returnValue = false;
            }
          }
        };
});
