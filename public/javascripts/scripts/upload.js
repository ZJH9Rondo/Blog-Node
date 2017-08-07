/*
* 文件粘贴、拖拽上传
*   ZJH9Rondo
*/
define(['GM'],function (GM){

  if(document.getElementById('createform')){
    (function (){
        var createform = document.getElementById('createform'),
            tips = document.getElementById('tips'),
            Ajax = GM.ajax(),
            client = GM.navigator_Agent(),
            imageFile;

        // 检测浏览器
        // create tips
        (function (){
            function navigator_supply(){
              var text = tips.childNodes[0];

              text.innerText = '当前浏览器，文本编辑插入图片同时支持鼠标及键盘复制粘贴上传';
              tips.style.display = 'block';
              tips.style.background = 'rgba(166,244,142,0.5)';
              text.style.color = '#359924';
            }

            function navigator_off(tips_text){
              var text = tips.childNodes[0];

              text.innerText = tips_text;
              tips.style.display = 'block';
              tips.style.background = 'rgba(251,215,210,1)';
              text.style.color = '#C63939';
            }

            function remove_Tips(){
              tips.addEventListener("click",function (){
                this.style.display = 'none';
              },false);
            }

            if(client.engine.webkit){
              if(client.browser.chrome){
                navigator_supply();
                remove_Tips();
              }else if(client.browser.safari){
                navigator_supply();
                remove_Tips();
              }
            }else if(client.engine.gecko){
              if(client.browser.firefox){
                var tips_firefox = '当前浏览器，文本编辑插入图片仅支持Ctrl+V复制粘贴上传';

                navigator_off(tips_firefox);
                remove_Tips();
              }else{
                var tips_others = '当前浏览器，文本编辑复制粘贴插入图片功能不保证完全支持，抱歉。';
                navigator_off(tips_others);
                remove_Tips();
              }
            }
        })();

        // textarea paste event
        createform.addEventListener('paste',function (e){
          // only for chrome
          e = e || event;
          e.preventDefault();
          var clipboardData = e.clipboardData || window.clipboardData; // clipboardData chrome,firefox || IE

          for(var i = 0,len = clipboardData.items.length;i < len; i++){
            if(clipboardData.items[i].kind == 'file' || clipboardData.items[i].type.indexOf('image') > -1){
              imageFile = clipboardData.items[i].getAsFile();
            }
          }

          var reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onload = function (event) {
              // event.target.result 即为图片的Base64编码字符串
              var base64_str = event.target.result,
                  upload_url,
                  UpToken;

              // 客户端直传函数
              function upload_base64(base64_str,upload_url,UpToken){
                var pic = base64_str,
                    url = upload_url,
                    xhr = new XMLHttpRequest();

                xhr.onreadystatechange = function (){
                  if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200){
                      var img = JSON.parse(xhr.responseText),
                          //Imgsrc = 'http://ou6y87mzi.bkt.clouddn.com/' + img.key;
                          // 测试链接
                          Imgsrc = 'http://7xqqm5.com1.z0.glb.clouddn.com/' + img.key;

                      console.log(img);
                      markdown_IMG(Imgsrc);
                  }
                };
                xhr.open("POST",url,true);
                xhr.setRequestHeader("Content-Type", "application/octet-stream");
                xhr.setRequestHeader("Authorization",'UpToken' + ' ' + UpToken);
                xhr.send(pic);
             }

             // Markdown语法插入图片
             function markdown_IMG(Imgsrc){
               var selectionStart = createform.selectionStart,
                   selectionEnd = createform.selectionEnd,
                   selectionText = createform.value,
                   insert_Img;

               insert_Img = '![MyBlog](' + Imgsrc +')'; // markdown 语法插入图片
               createform.value = selectionText.substring(0,selectionStart) + insert_Img + selectionText.substring(selectionEnd,selectionText.length);
               selectionStart = selectionEnd = selectionStart + insert_Img.length; //移动光标
             }

            // 获取token
            Ajax.init({
              url: '/getToken',
              method: 'get',
              datatype: 'json',
              success: function (result){

              base64_str = base64_str.replace(/^data:image\/\w+;base64,/, '');
              // 测试链接
              upload_url = 'http://upload.qiniu.com/putb64/' + imageFile.size;
              result = JSON.parse(result);
              UpToken = result.token;
              // 上传文件
              upload_base64(base64_str,upload_url,UpToken);
            }
          });
        };
      },false);
    })();
  }
});
