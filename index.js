'use strict';
let express =  require("express")
let morgan = require('morgan')

class ServerlessStaticServePlugin {

  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.pluginOptions = serverless.service.custom['static-serve']
    this.app = express()

    this.hooks = {
      "before:offline:start:init": this.startServe.bind(this),
      "after:offline:start:end": this.stopServe.bind(this),
    };
  }

  startServe() {
    let staticFolder = (this.pluginOptions.directory ? this.pluginOptions.directory : './public')
    let port = ( this.pluginOptions.port ? this.pluginOptions.port : 4001 )

    this.app.use(morgan('dev', {
      "stream": { write: (str) => {  this.serverless.cli.log( `[ Static Serve ] from ${ staticFolder } - ${ str }` ) } }
    }))
    this.app.use(express.static( staticFolder ))

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
