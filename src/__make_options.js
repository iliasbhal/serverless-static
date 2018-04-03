'use strict';

module.exports = (serverless, options) => {
    let pluginOptions = {},
        userOptions = serverless.service.custom['static']

        pluginOptions.serverless = makeServerlessOption(serverless, options)
        pluginOptions.folder = makeFolderOption( userOptions)
        pluginOptions.port = makePortOption( userOptions )

    return pluginOptions
}

// return serverless base configuration
function makeServerlessOption( serverless, options){
    return {
        name: serverless.service.name,
        provider: serverless.service.provider.name,
        stage: ( options.stage || serverless.service.provider.stage ),
        region: ( options.region || serverless.service.provider.region )
    }
}

// defualt folder is set to './public' path from root
function makeFolderOption( options ){
    if( !options || !options.folder ) { 
        return './public'
    } else {
        return options.folder
    } 
}

// defualt port is se to 4001
function makePortOption( options ){
    if( !options || !options.port ) { 
        return 4001
    } else {
        return options.port
    } 
}

