'use strict';

const actions = require('./src')
const _static = require('./src/__make_options')


module.exports = class ServerlessStaticServePlugin {

  constructor(serverless, options) {
    console.log( 'options', options )

    const static_env = _static( serverless, options ) // generate static object with all options available to the functions

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
      "before:offline:start:init": actions.serve.bind( null, serverless, static_env ), // hook from serverless-offline
      "before:offline:start": actions.serve.bind( null, serverless, static_env ), // hook from serverless-offline
      'static:serve:start': actions.serve.bind( null, serverless, static_env ),
      // 'static:serve': actions.serve.bind( null, serverless, static_env ),


      // // lifecycle hooks for statis:sync
      // "aws:deploy:deploy:uploadArtifacts": actions.sync.bind( null, serverless, static_env ),
      "static:sync:start": actions.sync.bind( null, serverless, static_env )
    };

  }

}
