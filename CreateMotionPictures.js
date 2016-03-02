var AWS = require('aws-sdk');
var async = require('async');
var fs = require('fs');
var exec = require('child_process').exec;
var uuid = require('node-uuid');

var s3 = new AWS.S3();

function getFileNo(num) {
  return ('00' + num).slice(-3); 
}

exports.handler = function(event, context) {
  var region = event.region;
  var bucket = event.bucket;
  var inputKeys = event.inputKeys;
  var outputKey = event.outputKey;
  var frameRate = event.frameRate || 2;

  AWS.config.region = region;

  var task_root = process.env['LAMBDA_TASK_ROOT'] || '.';
  var work_dir = process.env['LAMBDA_TASK_ROOT'] ? '/tmp' : '.';
  var ffmpeg_bin_dir = process.env['LAMBDA_TASK_ROOT'] ? './' : '';
  var movieTempName = uuid.v1();
  var outputTempFile = work_dir + "/" + movieTempName + '.mp4';
  var movieFrameFiles = [];
  var tasks = [];

  // ファイルダウンロード
  var downloadIndex = 0;
  var sequenceDownloader = function(callback) {

    var key = inputKeys[downloadIndex];
    var saveFrameFile = movieFrameFiles[downloadIndex]; 
    console.log('downloading ' + key + '...');

    var outputFile = fs.createWriteStream(saveFrameFile);
    var s3obj = s3.getObject({Bucket: bucket, Key: key}).createReadStream();

    outputFile.on('close', function() {
      console.log('downloaded ' + key);
      ++downloadIndex;
      callback(null);
    });

    s3obj.pipe(outputFile);
  };

  // ファイルアップロード
  var uploader = function(callback) {
    console.log("uploading...");

    var body = fs.createReadStream(outputTempFile);
    s3.putObject({
      Bucket: bucket,
      Key: outputKey,
      Body: body,
      ContentType: 'video/mp4'
    }, function(err) {
      if (err) { throw err; }
      console.log("uploaded");
      callback(null);
    });
  };

  // 動画作成
  var movieMaker = function(callback) {
    console.log("creating movie...");

    var cmd = ffmpeg_bin_dir + "ffmpeg -framerate " + frameRate + " -i " + work_dir + "/" + movieTempName + "_%03d.jpg -c:v libx264 -r 30 -pix_fmt yuv420p " + outputTempFile;
    exec(cmd, function(error, stdout, stderr) {
      console.log("created movie");
      callback(null);
    });
  };

  // ファイル削除
  var cleaner = function(callback) {
    console.log("removing files...");

    var files = [outputTempFile].concat(movieFrameFiles);
    files.forEach(function(file) {
      console.log("remove " + file);
      fs.unlinkSync(file);
    });

    console.log("removed files");
    callback(null, "completed");
  };

  // ジョブ作成
  inputKeys.forEach(function(key, index) {
    var saveTo = work_dir + "/" + movieTempName + "_" + getFileNo(index + 1) + ".jpg";
    movieFrameFiles.push(saveTo);
    tasks.push(sequenceDownloader);
  });
  tasks.push(movieMaker);
  tasks.push(uploader);
  tasks.push(cleaner);

  // ジョブ実行
  async.waterfall(tasks, function(err, result) {
    if (err) {
      throw err;
    }
    console.log('all done.', result);
    context.done();
  });
};

