/*
* 文件粘贴、拖拽上传
*   ZJH9Rondo
*/
define(['GM'],function (GM){

  if(document.getElementById('createform')){
    (function (){
        var createform = document.getElementById('createform'),
            Ajax = GM.ajax(),
            imageFile;

        createform.addEventListener('paste',function (e){
          // only for chrome
          e = e || event;
          e.preventDefault();
          var clipboardData = e.clipboardData; // clipboardData 获取事件数据

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
                  upToken;

              // 客户端直传函数
              function upload_base64(base64_str,upload_url,token){
                var pic = base64_str,
                    url = upload_url,
                    xhr = new XMLHttpRequest();

                xhr.onreadystatechange = function (){
                  if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200){
                      var img = JSON.parse(xhr.responseText),
                          Imgsrc = 'http://ou6y87mzi.bkt.clouddn.com/' + img.key;

                      markdown_IMG(Imgsrc);
                  }
                };
                xhr.open("POST",url,true);
                xhr.setRequestHeader("Content-Type", "application/octet-stream");
                xhr.setRequestHeader("Authorization",'UpToken' + ' ' + token);
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
              upload_url = 'http://upload-z2.qiniu.com/putb64/' + imageFile.size;
              result = JSON.parse(result);
              upToken = result.token;
              // 上传文件
              upload_base64(base64_str,upload_url,upToken);
            }
          });
        };
      },false);
    })();
  }
});
