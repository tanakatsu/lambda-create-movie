require('dotenv').config();
console.log('role=', process.env.LAMBDA_ROLE);

module.exports = {
  region: 'ap-northeast-1',
  handler: 'CreateMotionPictures.handler',
  role: process.env.LAMBDA_ROLE,
  functionName: 'CreateMotionPictures',
  timeout: 90
  // eventSource: {
  //  EventSourceArn: <event source such as kinesis ARN>,
  //  BatchSize: 200,
  //  StartingPosition: "TRIM_HORIZON"
  //}
}
