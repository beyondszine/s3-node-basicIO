var s3 = require('s3');

var client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: process.env.APIKEY,
    secretAccessKey: process.env.ACCESSKEY,
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
});

var fileupload  = function(bucketname, mfilename){
  var params = {
    localFile: mfilename,
    s3Params: {
      Bucket: bucketname,
      Key:  mfilename,
      ACL:  'public-read',
      // other options supported by putObject, except Body and ContentLength.
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
    },
  };

  var uploader = client.uploadFile(params);
  uploader.on('error', function(err) {
    console.error("unable to upload:", err.stack);
  });
  uploader.on('progress', function() {
    console.log("progress", uploader.progressMd5Amount,
              uploader.progressAmount, uploader.progressTotal);
  });
  uploader.on('end', function() {
    console.log("done uploading");
    getUrl(bucketname,mfilename,"us-west-2");

  });
};

var filedownload  = function(bucketname,mfilename){
  var params = {
  localFile: mfilename,
  s3Params: {
    Bucket: bucketname,
    Key: mfilename,
    // other options supported by getObject
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
    },
  };
  var downloader = client.downloadFile(params);
  downloader.on('error', function(err) {
    console.error("unable to download:", err.stack);
  });
  downloader.on('progress', function() {
    console.log("progress", downloader.progressAmount, downloader.progressTotal);
  });
  downloader.on('end', function() {
    console.log("done downloading");
  });
};

var syncdDir = function(srcLocalDir,destRemotDir){
  var params = {
    localDir: srcLocalDir,
    deleteRemoved: true,
    s3Params: {
      Bucket: "machersamples",
      Prefix: destRemotDir,
    },
  };
  var uploader = client.uploadDir(params);
  uploader.on('error', function(err) {
    console.error("unable to sync:", err.stack);
  });
  uploader.on('progress', function() {
    console.log("progress", uploader.progressAmount, uploader.progressTotal);
  });
  uploader.on('end', function() {
    console.log("done uploading");
  });
};

var listDir = function(destRemotDir){
  var params= {
      recursive:false,
      s3Params:{
        Bucket: "machersamples",
        Prefix: destRemotDir,
        MaxKeys: 10,
      }
  };
  var lister = client.listObjects(params);
  lister.on('error', function(err) {
    console.error("unable to sync:", err.stack);
  });
  lister.on('progress', function() {
    //console.log("progress");
    if(lister.dirsFound){
      console.log("progress", lister.progressAmount, lister.progressTotal);

    }
  });
  lister.on('end', function() {
    console.log("done uploading");
  });
  lister.on('data',function(data){
    console.log('data objects found',data);
  });
}


var getUrl=function(mbucket,key,bucketlocation){
  console.log(s3.getPublicUrl(mbucket,key,bucketlocation));
};

fileupload('machersamples','google200.png');
//filedownload('machersamples','spatt.png');
//syncdDir(__dirname+'/log','log');
//listDir('log/');
