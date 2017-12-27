var albumBucketName = 'ganis3-001';
var bucketRegion = 'us-west-2';
var IdentityPoolId = '1p1o3fudravdn4486tkrs5pu9q';

AWS.config.update({
  accessKeyId : 'AKIAJ6DVAUKUQI2GJEMA',
  secretAccessKey : '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',
  region: bucketRegion
});


var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {
    Bucket: albumBucketName,
    Prefix: 'Artists/JOJ/',
    Delimiter: '/'
  }
});
