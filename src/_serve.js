'use strict';
let express =  require("express")
let morgan = require('morgan')

module.exports = (cli, staticOptions) => {
  return new Promise((resolve, reject)=>{

    let app = express()
    let staticFolder = ( staticOptions.directory ? staticOptions.directory : './public')
    let servePort = ( staticOptions.port ? staticOptions.port : 4001 )

    app.use(morgan('dev', {
      "stream": { 
        write: (str) => { 
            let write = `[ Static Serve ] from ${ staticFolder } - ${ str }`
            cli.log( write.replace(/[\n\r]+/g, '').trim() ) 
        } 
      }
    }))
    
    app.use(express.static( staticFolder ))

    app.listen(servePort, () => { 
      cli.consoleLog('') 
      cli.log( `[ Static Serve ] serving files on http://localhost:${ servePort }` )
      cli.log( `[ Static Serve ] serving files from ${ staticFolder }` ); 
      resolve()
    });

  })
}





