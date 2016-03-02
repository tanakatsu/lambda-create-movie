# AWS Lambda function to create a movie from pictures


### Run locally
`$ npm install`
`$ node CreateMotionPictures_driver.js`


### Deployment
`$ gulp deploy`

### Testing using Lambda console

Input test event should be like this.
`{
  "region": "ap-northeast-1",
  "bucket": [YOUR BUCKET NAME],
  "inputKeys": ["sample/sample_001.jpg", "sample/sample_002.jpg", "sample/sample_003.jpg", "sample/sample_004.jpg", "sample/sample_005.jpg", "sample/sample_006.jpg", "sample/sample_007.jpg", "sample/sample_008.jpg"],
  "outputKey": "movies/sample.mp4"    
}
`

You need to upload some pictures to S3 buckets (sample/sample_*.jpg) in advance.

### Running without S3

You can run the app withtout S3 files.

`$ node CreateMotionPictures_local.js -r 1 -o hoge.mp4 input1.jpg input2.jpg ...`
