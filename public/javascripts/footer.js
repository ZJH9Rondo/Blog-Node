// 下拉框脚本
// 点击按钮弹出下拉框
window.onload=function (){
  $('.ui.dropdown').dropdown();

  // 鼠标悬浮 弹出提示框
  $('.post-content .avatar').popup({
    inline: true,
    position: 'bottom right',
    lastResort: 'bottom right',
  });
};
