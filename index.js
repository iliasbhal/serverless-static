'use strict';
let express =  require("express")
let morgan = require('morgan')

const AWS = require('aws-sdk');
const s3 = require('@monolambda/s3')

const actions = require('./src')


module.exports = class ServerlessStaticServePlugin {

  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.provider = 'aws';
    this.stage = options.stage || this.serverless.service.provider.stage
    this.region = options.region || this.serverless.service.provider.region

    this.cli = this.serverless.cli


    this.staticOptions = this.serverless.service.custom['static-serve']


    // this.aws = this.serverless.getProvider(this.provider);
    // this.awsCredentials = this.aws.getCredentials();

    // this.s3 = s3.createClient({
    //   s3Client: new AWS.S3({
    //     region: this.awsCredentials.region,
    //     credentials: this.awsCredentials.credentials
    //   })
    // });

    // console.log(staticOptions)



    this.commands = {
      static: {
        usage: 'serve local directory',
        lifecycleEvents: ['serve'],
        commands: {
          serve: {
            usage: 'serve local directory',
            lifecycleEvents: [ 'start' ],
          },
          sync: {
            usage: 'sync local directory with bucket speficied inside serverless.yml file',
            lifecycleEvents: [ 'start' ],
          }
        }
      }
    };
    

    this.hooks = {
      // lifecycle hooks for static:serve
      "before:offline:start:init": actions.serve.bind( null, this.cli, this.staticOptions ), // hook from serverless-offline
      "before:offline:start": actions.serve.bind( null, this.cli, this.staticOptions ), // hook from serverless-offline
      'static:serve:start': actions.serve.bind( null, this.cli, this.staticOptions ),


      // // lifecycle hooks for statis:sync
      // "aws:deploy:deploy:uploadArtifacts": this.deployBucket.bind(this),
      // "static:sync:start": this.deployBucket.bind(this)
    };

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

}




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