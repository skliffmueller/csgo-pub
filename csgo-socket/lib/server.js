'use strict'

const restify = require('restify')
const config = require('config')
const fs = require('fs')
const _ = require('lodash')

const cache = require('./cache')
const logger = require('./logger')

restify.defaultResponseHeaders = false

let secureServerOptions = {
  name: 'CPub Socket',
  // ca: fs.readFileSync('./certs/DigiCertCA.crt'),
  // key: fs.readFileSync('./certs/cpub_co.key'),
  // certificate: fs.readFileSync('./certs/cpub_co.crt')
  //rejectUnauthorized: true //TODO: Enable this when ready for SSL pinning
}


if (process.env.NODE_ENV === 'development-local' || process.env.DFS_USE_INTERNAL_SSL === 'no') {
  secureServerOptions = { name: 'CPub Socket' }
}

function loadMiddleware(server) {
  server.use(restify.gzipResponse())

  let io = require('socket.io')(server.server, {transports: ['websocket']})
  // io.engine.ws = new (require('uws').Server)({
  //     noServer: true,
  //     perMessageDeflate: false
  // })
  
  io.on('connection', function (socket) {
    /*
        Subscription channels
        images
        notifications
        servers

    */
    socket.on('subscribe', function (data) {
        socket.join(data)
    })

    socket.on('unsubscribe', function (data) {
        socket.leave(data)
    })
  })

  server.io = io
}

let secureServer = null
let io = null

secureServer = restify.createServer(secureServerOptions)
loadMiddleware(secureServer)

let PORT = process.env.PORT || 443
secureServer.listen(PORT, () => {
  logger.info(`HTTPS ${secureServer.name} listening at ${secureServer.url} with environment ${process.env.NODE_ENV}`)
})

module.exports = secureServer