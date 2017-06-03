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
          },

          // 封装Ajax [跨域,同源]
          ajax: function (){
             var  xhr, // 全局变量
                  Ajax = function (params){
                      this.settings = {
                        url: "",
                        datatype: "",
                        async: true, // 默认异步请求
                        method: "",
                        data: {}
                      };
                      this.sendData(params);
                  };

              // 原型方法
              Ajax.prototype = {
                constructor: Ajax,
                // 创建XHR对象
                createXHR: function (){
                    if(typeof XMLHttpRequest != "undefined"){
                        return new XMLHttpRequest();
                    }else if(typeof ActiveXObject != "undefined"){
                      // 针对IE7之前版本
                        if(typeof arguments.callee.activeXString != "string"){
                            // IE中三个不同版本XHR对象
                            var versions = ["MSXML2.XMLHttp.6.0","MSXML2.XMLHttp.3.0","MSXML2.XMLHttp"],
                            i,
                            len;

                            for(i = 0,len = versions.length; i < len; i++){
                                try{
                                  new ActiveXObject(versions[i]); // 实例化IE的XHR对象
                                  arguments.callee.activeXString = versions[i];
                                  break;
                                }catch (ex){
                                  //
                                }
                            }
                        }
                        return new ActiveXObject(arguments.callee.activeXString);
                    }else{
                        throw new Error("No XHR Object Available");
                    }
                },

                sendData: function (params){
                    xhr = new this.createXHR(); // 实例化 XMLHttpRequest
                    params = params || {};
                    params.data = params.data || {};
                    if(params.url && params.datatype && params.method){
                        this.settings.url = params.url;
                        this.settings.datatype = params.datatype;
                        this.settings.data = params.data;
                        this.settings.method = params.method;
                    }else{
                        console.log("The params has wrong!");
                        return;
                    }
                    // 获取状态码
                    // 检测异步请求
                    function complete(){
                      if(xhr.readyState == 4){
                        if((xhr.status >= 200 && xhr.status <300) || xhr.status == 304){
                            console.log(xhr.status);
                            // 未对返回的JSON做处理
                            // 勿用 statusText == 'success' 做判定条件 不适用跨浏览器场景
                            if(params.success){
                              // 设置回调函数
                                params.success(xhr.responseText);
                          }
                        }
                      }
                    }

                    // 同源请求 [GET,POST] JSON
                    if(this.settings.datatype == 'json' || this.settings.datatype == 'JSON'){
                        if(this.settings.method == 'get' || this.settings.method == 'GET'){
                          // GET请求
                            for(var item in this.settings.data){
                                this.settings.url = this.addURLParam(this.settings.url,item,this.settings.data[item]);
                            }

                            xhr.onreadystatechange = complete;
                            xhr.open(this.settings.method,this.settings.url,this.settings.async);
                            xhr.send(null);
                        }
                        if(this.settings.method == 'post' || this.settings.method == 'POST'){
                          // POST请求
                            xhr.onreadystatechange = complete;
                            xhr.open(this.settings.type,this.settings.url,this.settings.async);
                            xhr.setRequestHeader = ("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
                            xhr.send(this.settings.data);
                        }
                    }

                    // 非同源JSONP
                    if(this.settings.datatype == 'jsonp' || this.settings.datatype == 'JSONP'){
                        if(this.settings.method == 'get' || this.settings.method == 'GET'){

                            var callbackName = params.JSONP, // 设置jsonp的回调函数名
                                head = document.getElementsByTagName('head')[0],
                                scriptJsonp = document.createElement('script');

                            this.settings.data.callback = callbackName;
                            head.appendChild(scriptJsonp);

                            // 创建JSONP的回调函数
                            window[callbackName] = function (JSON){
                                  head.removeChild(scriptJsonp);
                                  clearTimeout(scriptJsonp.timer);
                                  window[callbackName] = null;
                                  if(params.success){
                                    // 设置回调函数
                                      params.success(JSON);
                                  }
                            };

                            // 设置超时处理
                            if(params.timeout){
                                scriptJsonp.timer = setTimeout(function () {
                                    head.removeChild(scriptJsonp);
                                    if(params.error){
                                      // 请求超时 手动设置返回数据
                                        params.error({message: "Request is Timeout"});
                                    }
                                    window[callbackName] = null;
                                }, params.timeout);
                            }

                          // 处理JSONP跨域请求URL
                            this.settings.url = this.settings.url + "?callback=" + callbackName;
                            for(var src in this.settings.data){
                                this.settings.url=this.addURLParam(this.settings.url,src,this.settings.data[src]);
                            }

                          // 设置请求随即会自动发送请求
                            scriptJsonp.src = this.settings.url;
                        }
                    }
                },

                // 处理URL
                addURLParam: function (url,name,value){

                    url += (url.indexOf("?") == -1 ? "?" : "&");
                    url += encodeURIComponent(name)+"="+encodeURIComponent(value);
                    return url;
                },

              // 序列化
                serialize: function (data){
                  var val="";
                  var str="";

                  for(var item in data){
                    str=item+"="+data[item];
                    val+=str+'&';
                  }
                  return val.slice(0,val.length-1);
                }
              };

              return {
                init: function (params){
                  new Ajax(params);
                }
              };
          }
      };
});
