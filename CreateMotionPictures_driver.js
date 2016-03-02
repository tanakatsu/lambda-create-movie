require('dotenv').config();
console.log('bucket=', process.env.S3_BUCKET);

//YOUR DATA TO BE PASSED TO LAMBDA FUNCTION.
var event = {
  "region": "ap-northeast-1",
  "bucket": process.env.S3_BUCKET,
  "inputKeys": ["sample/sample_001.jpg", "sample/sample_002.jpg", "sample/sample_003.jpg", "sample/sample_004.jpg", "sample/sample_005.jpg", "sample/sample_006.jpg", "sample/sample_007.jpg", "sample/sample_008.jpg"],
  "outputKey": "movies/sample.mp4"
};

//BUILD STAB OF context OBJECT.
var context = {
  invokeid: 'invokeid',
  done: function(err, message){
    return;
  }
};


//RUN YOUR HANDLER
var lambda = require("./CreateMotionPictures.js");
lambda.handler(event, context);
