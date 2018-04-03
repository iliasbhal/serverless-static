'use strict';
let express =  require("express")
let morgan = require('morgan')

module.exports = (serverless, settings ) => {
  return new Promise((resolve, reject)=>{

    // settings.folder -> folder to serve
    // setting.port -> port used to configure localhost

    let app = express()

    app.use(morgan('dev', {
      "stream": { 
        write: (str) => { 
            let write = `[ Static Serve ] from ${ settings.folder } - ${ str }`
            serverless.cli.log( write.replace(/[\n\r]+/g, '').trim() ) 
        } 
      }
    }))
    
    app.use(express.static( settings.folder ))

    app.listen( settings.port, () => { 

      serverless.cli.consoleLog('') 
      serverless.cli.log( `[ Static Serve ] serving files on http://localhost:${ settings.port }` )
      serverless.cli.log( `[ Static Serve ] serving files from ${ settings.folder } folder` ); 
      resolve()

    });

  })
}





