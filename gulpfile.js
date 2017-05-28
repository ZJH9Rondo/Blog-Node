var gulp = require('gulp'),
    uglify = require('gulp-uglify'), // 最小化 javascript 文件
    livereload = require('gulp-livereload'), // 改动后自动刷新浏览器
    stylus = require('gulp-stylus'),    // stylus 预编译插件
    plumber = require('gulp-plumber'),  // 例外处理 避免例外导致gulp watch失效
    concat = require('gulp-concat'),
    minifyCss = require('gulp-minify-css');

var js_Src = './public/javascripts/';
// 基于stylus进行预编译输出
gulp.task('stylus',function (){
  gulp.src('./public/stylesheets/stylus/*.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(gulp.dest('./public/stylesheets/style'))
    .pipe(livereload());
});

gulp.task('watch',function (){
  gulp.watch('./public/stylesheets/stylus/*.styl',['stylus']);
});

// 压缩css文件
gulp.task('concatCss', function() {
    gulp.src(['./public/stylesheets/style/*.css'])
        .pipe(concat('style.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./public/stylesheets'));
});

gulp.watch('./public/stylesheets/style/*.css', ['concatCss']);

// 压缩合并js文件
gulp.task('uglify',function (){
  gulp.src([js_Src+'main.js',js_Src+'require.js'])
      .pipe(uglify())
      .pipe(gulp.dest('./public/javascripts'));
});

gulp.watch('./public/javascripts/*.js',['uglify']);

gulp.task('default', [
  'stylus',
  'uglify',
  'watch'
]);
