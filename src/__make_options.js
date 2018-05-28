'use strict';

module.exports = (serverless, options) => {
        let staticOptions = serverless.service.custom['static']

        return { 
          serverless: makeServerlessOption(serverless, options),
          path: makePathOption( staticOptions),
          port: makePortOption( staticOptions ) ,
          bucket: staticOptions['bucket'] || null,
          deploy: staticOptions['deploy'] || null
        }
}

// return serverless base configuration
function makeServerlessOption( serverless, options){
    return {
        name: serverless.service.provider.name,
        provider: serverless.service.provider.name,
        stage: ( options.stage || serverless.service.provider.stage ),
        region: ( options.region || serverless.service.provider.region )
    }
}

// defualt folder is set to './public' path from root
function makePathOption( options ){

    // console.log( 'make path' ,  options['path'])
    if( !options || !options['path']) { 
        return './public'
    } else {
        return options['path']
    } 
}

// defualt port is se to 4001
function makePortOption( options ){
    if( !options || !options.port ) { 
        return 8000
    } else {
        return options.port
    } 
}

