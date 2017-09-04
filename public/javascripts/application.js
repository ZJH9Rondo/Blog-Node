// 主入口文件
requirejs.config({
    baseUrl: "/javascripts/scripts", // 配置默认访问路径
});

requirejs(['GM','page','upload'],function(GM,page,upload){
  // 用户登录浮出层
  (function (){
    var sign = document.getElementById('sign');

    if(sign){
      sign.addEventListener('click',function (){
        $('.ui.basic.modal').modal('show');
      },false);
    }
  })();

  // github第三方登录token认证
  (function (){
    var Ajax = GM.ajax(); // 实例化一个Ajax对象
    var github = document.getElementById('github');

    if(github){
      github.addEventListener('click',function (){
        Ajax.init({
          url: '/github',
          method: 'get',
          datatype: 'json',
          success: function (result){
            result = JSON.parse(result);
            var url = 'https://github.com/login/oauth/authorize?client_id=' + result;

            window.location = url;
          }
        });
      },false);
    }
  })();

  // 获取user_repos信息
  (function (){
    var repos = document.getElementById('repos'),
        Ajax = GM.ajax(),
        data;

        if(repos){
          data = {
            "author": repos.getAttribute('author')
          };
          Ajax.init({
            url: '/repos',
            method: 'get',
            data: data,
            datatype: 'json',
            success: function (result){
              var str = '';
              result = JSON.parse(result);
              for(var i = 0;i < result.length;i++){
                str = str + '<tr><td><div class=\'ui.rabbon.label\'>'+result[i].name+'</div></td>'+'<td>'+ result[i].language+'</td>' + '<td>' + result[i].star + '</td></tr>';
              }

              repos.innerHTML = str;
            }
          });
        }
  })();
});
