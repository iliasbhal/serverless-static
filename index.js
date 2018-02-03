'use strict';
let express =  require("express")
let morgan = require('morgan')

class ServerlessStaticServePlugin {

  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.app = express()

    this.hooks = {
      "before:offline:start:init": this.startServe.bind(this),
      "after:offline:start:end": this.stopServe.bind(this),
    };
  }

  startServe() {
    // getting all custom variables for the plugin
    let pluginOptions = serverless.service.custom['static-serve']

    // default values
    let staticFolder = ( pluginOptions.directory ? pluginOptions.directory : './public')
    let port = ( pluginOptions.port ? pluginOptions.port : 4001 )

    // use morgan combined with serverless.log
    this.app.use(morgan('dev', {
      "stream": { 
        write: (str) => { 
         this.serverless.cli.log( `[ Static Serve ] from ${ staticFolder } - ${ str }` ) 
        } 
      }
    }))
    
    // serve files 
    this.app.use(express.static( staticFolder ))

    // lauch the server that will serve files in localhost
    this.server = this.app.listen(port, () => { 
      this.serverless.cli.log( `[ Static Serve ] serving files on http://localhost:${ port}` )
      this.serverless.cli.log( `[ Static Serve ] serving files from ${ staticFolder }` ); 
    });
  }

  stopServe(){
    if (this.server) {
      this.server.close();
    }
  }

}

module.exports = ServerlessStaticServePlugin;
