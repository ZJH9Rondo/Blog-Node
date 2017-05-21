var gulp = require('gulp'),
    uglify = require('gulp-uglify'), // 最小化 javascript 文件
    livereload = require('gulp-livereload'), // 改动后自动刷新浏览器
    stylus = require('gulp-stylus'),    // stylus 预编译插件
    plumber = require('gulp-plumber'),  // 例外处理 避免例外导致gulp watch失效
    concat = require('gulp-concat'),
    minifyCss = require('gulp-minify-css');

gulp.task('stylus',function (){
  // 默认任务
  gulp.src('./public/stylesheets/stylus/*.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(gulp.dest('./public/stylesheets/style'))
    .pipe(livereload());
});

gulp.task('watch',function (){
  gulp.watch('./public/stylesheets/stylus/*.styl',['stylus']);
});

gulp.task('concatCss', function() {
    gulp.src(['./public/stylesheets/style/*.css'])
        .pipe(concat('style.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./public/stylesheets'));
});

gulp.watch('./public/stylesheets/style/*.css', ['concatCss']);

gulp.task('default', [
  'stylus',
  'watch'
]);
