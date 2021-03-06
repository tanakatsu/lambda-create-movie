var gulp = require('gulp');
var zip = require('gulp-zip');
var del = require('del');
var install = require('gulp-install');
var runSequence = require('run-sequence');
var awsLambda = require('node-aws-lambda');

var mainJsFile = 'CreateMotionPictures.js'; // Lambdaファンクションの本体
var ffmpegBinary = 'ffmpeg'

// distディレクトリのクリーンアップと作成済みのdist.zipの削除
gulp.task('clean', function() {
  return del(['./dist', './dist.zip']);
});
 
// AWS Lambdaファンクション本体(index.jsなど)をdistディレクトリにコピー
gulp.task('js', function() {
  return gulp.src(mainJsFile)
    .pipe(gulp.dest('dist/'));
});
 
gulp.task('ffmpeg', function() {
  return gulp.src(ffmpegBinary)
    .pipe(gulp.dest('dist/'));
});
 
// AWS Lambdaファンクションのデプロイメントパッケージ(ZIPファイル)に含めるnode.jsパッケージをdistディレクトリにインストール
// ({production: true} を指定して、開発用のパッケージを除いてインストールを実施)
gulp.task('node-mods', function() {
  return gulp.src('./package.json')
    .pipe(gulp.dest('dist/'))
    .pipe(install({production: true}));
});
 
// デプロイメントパッケージの作成(distディレクトリをZIP化)
gulp.task('zip', function() {
  return gulp.src(['dist/**/*', '!dist/package.json'])
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest('./'));
});
 
// AWS Lambdaファンクションの登録(ZIPファイルのアップロード)
// (既にFunctionが登録済みの場合はFunctionの内容を更新)
gulp.task('upload', function(callback) {
  awsLambda.deploy('./dist.zip', require("./lambda-config.js"), callback);
});
 
gulp.task('deploy', function(callback) {
  return runSequence(
    ['clean'],
    ['js', 'ffmpeg', 'node-mods'],
    ['zip'],
    ['upload'],
    callback
  );
});
