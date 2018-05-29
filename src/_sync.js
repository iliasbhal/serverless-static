'use strict';

module.exports = (serverless, settings ) => {
  return new Promise((resolve, reject)=>{

    //   console.log = serverless.cli.log

    if( ( serverless.processedInput.commands[0] == 'static' && !settings['bucket'] )  ||
        ( serverless.processedInput.commands[0] == 'deploy' && settings['deploy'] && !settings['bucket'] ) ){
        throw new Error("[ Static ] Error: No bucket is specified in serverless.yml")
    }  

    // settings.path -> folder to serve
    // setting.bucket -> port used to configure localhost
    // settings.deploy -> if user wants to sync bucket during deployment

    if( serverless.processedInput.commands[0] == 'static' || settings['deploy']){
        //  -------------------------------  //
        // |      BEGIN SYNC WITH BUCKET   | //
        //  -------------------------------  //
        switch( settings.serverless['name'] ){
            case 'aws': syncWithAWS.apply( this , [ serverless, settings ]).then(resolve).catch(reject) ; break
            default : throw new Error("[ Static ] Error: only AWS is available as a cloud provider for serverless-static plugin")
        }
    } 
  })
}


// 'this' is serverless
function syncWithAWS( serverless, settings ){
    const AWS = require('aws-sdk');
    const s3 = require('@monolambda/s3');

    return new Promise((resolve, reject)=>{
        let AWS = serverless.getProvider('aws')['sdk']
        let profileName = serverless.service.provider.profile 
        let bucketName = settings['bucket']

        if( profileName ){
            AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: profileName }) 
        }
        
        let S3 = new AWS['S3']()
    
        getOrCreateBucket(S3, bucketName).then((buckets)=>{
            // the bucket exists or is now created
            var client = s3.createClient({ s3Client: S3 });

            var params = {
                localDir: settings['path'],
                deleteRemoved: true, // default false, whether to remove s3 objects that have no corresponding local file.
                s3Params: { // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
                  Bucket: bucketName, // other options supported by putObject, except Body and ContentLength.
                  ACL: 'public-read'
                //   Prefix: "/",
                }
            };

            deleteBucketContent(client, params['s3Params'])
            .then( uploadBucketContent.bind( serverless, client, params ) )
            .then( resolve )
            .catch( reject )


           

            // resolve()
        })
        .catch( reject )
    })
}

function deleteBucketContent(client, params){
    return new Promise(( resolve, reject )=>{
        let folderDeleter = client.deleteDir(params)
        folderDeleter.on('error', reject );
        folderDeleter.on('end', resolve);
    })
}

// this = serverless
function uploadBucketContent(client, params){
    return new Promise(( resolve, reject )=>{
        let uploader =  client.uploadDir(params)
        this.cli.log( `[ STATIC ] sync ${ params['localDir'] } to bucket ${ params['s3Params']['Bucket'] }` ) 

        uploader.on('error', reject );
        uploader.on('end', resolve);

        let oldProgress = 0
        uploader.on('progress', ()=> {
            if(  uploader.progressAmount > 0 &&  uploader.progressTotal > 0){
                let progress = (( uploader.progressAmount / uploader.progressTotal ) * 100).toString()
                                    .substr(0,3).replace('.', '')
                
                if( oldProgress != progress ){ 
                    oldProgress = progress
                    // progress = 0, 1, 85 .... -> 100
                    // this.cli.log( `[ STATIC ] sync ${ params['localDir'] } to bucket ${ params['s3Params']['Bucket'] }` ) 
                }
            }
        });
    })
}

function getOrCreateBucket( S3, bucketName){
    return new Promise(( resolve, reject )=>{
        listBuckets(S3).then((buckets)=>{
        
            let bucketExistsAlready = buckets.reduce(( acc, current )=>{
                return acc ? acc : current['Name'] == bucketName
            }, false)

            if( !bucketExistsAlready){

                var bucketParams = {
                    Bucket: bucketName, /* required */
                    ACL: 'public-read'
                  };

                S3.createBucket(bucketParams, function(err, data) {
                    if (err) { reject(err); return }// an error occurred
                    resolve(true);         // successful response
                });
                
            } else {
                resolve(true)
            }
        })
        .catch( reject )
    })
}

function listBuckets(S3){
    return new Promise(( resolve, reject )=>{
        S3.listBuckets({}, (err, data)=>{
            if (err) reject(err); // an error occurred
            else     resolve(data['Buckets']);   
        }) 
    })
}
  // deployBucket(){ 
  //   // console.log(this.serverless)
  //   return new Promise((resolve, reject)=>{
  //     if( !this.bucketToDeploy ){ resolve(); return; }
  //     this.serverless.cli.log( `[ Static Deploy ] sync ${ this.staticFolder } folder with bucket ${ this.bucketToDeploy }` );
  //     this._bucketDeploymentProcess(resolve, reject)
  //   })
  // }

  // _bucketDeploymentProcess(resolve, reject ){

  //   this.createBucketIfNotExist( this.bucketToDeploy )
  //   .then( this.configureBucket.bind( this, this.bucketToDeploy ) )
  //   .then( resolve, reject )

  // }

  // createBucketIfNotExist(bucketToDeploy){ 
  //   return new Promise((resolve, reject)=>{

  //     this.checkIfBucketExist(bucketToDeploy)
  //       .then((exists)=>{
  //           if( !exists ){

  //             let params = {
  //               Bucket: bucketToDeploy
  //             };
        
  //             this.serverless.cli.log( `[ Static Deploy ] Creating bucket ${ bucketToDeploy }` );
  //             this.aws.request('S3', 'createBucket', params, this.stage, this.region)
  //                 .then( resolve.bind(this, true), reject )

  //           } else {
  //             resolve(true)
  //           }
  //       })

  //   })
  // }

  // checkIfBucketExist(bucketToDeploy){ 
  //   // list all buckets and check if the destination bucket exist already or not
  //   return new Promise((resolve, reject)=>{
  //     this.aws.request('S3', 'listBuckets', {}, this.stage, this.region).bind(this)
  //         .then((data)=>{ 
  //               resolve(
  //                 data.Buckets.reduce(( toReturn, bucket )=>{
  //                   return ( bucket.Name == bucketToDeploy || toReturn )
  //                 }, false )
  //               )
  //         }) 
  //   })
  // }

  // configureBucket(bucketToDeploy){
  //   // configure bucket to behave like a website bucket
  //   return new Promise((resolve, reject)=>{
  //     this.serverless.cli.log( `[ Static Deploy ] Configuring bucket ${ bucketToDeploy }` );
  //     resolve()
  //   })
  // }

// }




// function configureBucket() {
//   this.serverless.cli.log(`Configuring website bucket ${this.bucketName}...`);

//   let params = {
//     Bucket: this.bucketName,
//     WebsiteConfiguration: {
//       IndexDocument: { Suffix: 'index.html' },
//       ErrorDocument: { Key: 'error.html' }
//     }
//   };

//   return this.aws.request('S3', 'putBucketWebsite', params, this.stage, this.region)
// }

// function configurePolicyForBucket(){
//   this.serverless.cli.log(`Configuring policy for bucket ${this.bucketName}...`);

//   let policy = {
//     Version: "2008-10-17",
//     Id: "Policy1392681112290",
//     Statement: [
//       {
//         Sid: "Stmt1392681101677",
//         Effect: "Allow",
//         Principal: {
//           AWS: "*"
//         },
//         Action: "s3:GetObject",
//         Resource: "arn:aws:s3:::" + this.bucketName + '/*'
//       }
//     ]
//   };

//   let params = {
//     Bucket: this.bucketName,
//     Policy: JSON.stringify(policy)
//   };

//   return this.aws.request('S3', 'putBucketPolicy', params, this.stage, this.region);
// }

// function configureCorsForBucket(){
//   this.serverless.cli.log(`Configuring CORS policy for bucket ${this.bucketName}...`);

//   let putPostDeleteRule = {
//     AllowedMethods: [
//       'PUT',
//       'POST',
//       'DELETE'
//     ],
//     AllowedOrigins: [
//       'https://*.amazonaws.com'
//     ],
//     AllowedHeaders: [
//       '*'
//     ],
//     MaxAgeSeconds: 0
//   };

//   let getRule = {
//     AllowedMethods: [
//       'GET'
//     ],
//     AllowedOrigins: [
//       '*'
//     ],
//     AllowedHeaders: [
//       '*'
//     ],
//     MaxAgeSeconds: 0
//   };

//   let params = {
//     Bucket: this.bucketName,
//     CORSConfiguration: {
//       CORSRules: [
//         putPostDeleteRule,
//         getRule
//       ]
//     },
//   };

//   return this.aws.request('S3', 'putBucketCors', params, this.stage, this.region);
// }