var async = require('async');
var fs = require('fs');
var exec = require('child_process').exec;
var uuid = require('node-uuid');
var argv = require('argv');

// 入力
var args = argv.option([{
  name: 'output',
  short: 'o',
  type: 'string'
},
{
  name: 'framerate',
  short: 'r',
  type: 'float'
}
]).run();
console.log(args);

// 入力
var inputFiles = args.targets;
var outputFile = args.options.output || 'out.mp4';
var frameRate = args.options.framerate || 2;
console.log("inputFiles=" + inputFiles);
console.log("outputFile=" + outputFile);
console.log("frameRate=" + frameRate);

var movieTempName = uuid.v1();
var movieFrameFiles = [];
var tasks = [];

function getFileNo(num) {
  return ('00' + num).slice(-3); 
}

// ファイルコピー
var fileNo = 0;
var sequenceDownloader = function(callback) {

  var inputFileName = inputFiles[fileNo];
  var saveFrameFile = movieFrameFiles[fileNo]; 
  console.log('copying ' + inputFileName + '...');

  var outputFile = fs.createWriteStream(saveFrameFile);
  var inputFile = fs.createReadStream(inputFileName);

  outputFile.on('close', function() {
    console.log('copied ' + inputFileName);
    ++fileNo;
    callback(null);
  });

  inputFile.pipe(outputFile);
};

// 動画作成
var movieMaker = function(callback) {
  console.log("creating movie...");

  var cmd = "ffmpeg -framerate " + frameRate + " -i " + movieTempName + "_%03d.jpg -c:v libx264 -pix_fmt yuv420p " + outputFile;
  console.log(cmd);

  exec(cmd, function(error, stdout, stderr) {
    console.log("created movie");
    callback(null);
  });
};

// ファイル削除
var pre_cleaner = function(callback) {
  // http://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js
  
  try {
    fs.accessSync(outputFile, fs.F_OK);
    // Do something
    console.log("remove " + outputFile);
    fs.unlinkSync(outputFile);
    console.log("removed files");
  } catch (e) {
    // It isn't accessible
    console.log("outputFile does not exist");
  }

  callback(null);
};

var cleaner = function(callback) {
  console.log("removing files...");

  var files = movieFrameFiles;
  files.forEach(function(file) {
    console.log("remove " + file);
    fs.unlinkSync(file);
  });

  console.log("removed files");
  callback(null, "completed");
};


// ジョブ作成
inputFiles.forEach(function(_name, index) {
  var saveTo = movieTempName + "_" + getFileNo(index + 1) + ".jpg";
  movieFrameFiles.push(saveTo);
  tasks.push(sequenceDownloader);
});
tasks.push(pre_cleaner);
tasks.push(movieMaker);
tasks.push(cleaner);


// ジョブ実行
async.waterfall(tasks, function(err, result) {
  if (err) {
    throw err;
  }
  console.log('all done.', result);
});

