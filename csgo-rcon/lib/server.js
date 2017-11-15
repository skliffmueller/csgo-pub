'use strict'

const restify = require('restify')
const config = require('config')
const fs = require('fs')

const db = require('./db')
const redis = require('./redis')
const logger = require('./logger')
const middleware = require('../middleware')


restify.defaultResponseHeaders = false

let secureServerOptions = {
  name: 'CPub',
  // ca: fs.readFileSync('./certs/DigiCertCA.crt'),
  //key: fs.readFileSync('./certs/server.key'),
  //certificate: fs.readFileSync('./certs/server.crt')
  //rejectUnauthorized: true //TODO: Enable this when ready for SSL pinning
}

//
//  TODO: Enable HTTP/2 support
//
// var secureServerOptions = {
//   name: 'BNotes Platform API Gateway',
//   spdy: {
//     ca: fs.readFileSync('./certs/DigiCertCA.crt'),
//     key: fs.readFileSync('./certs/star_platform_com.key'),
//     cert: fs.readFileSync('./certs/star_platform_com.crt'),

//     // // Private key
//     // key: fs.readFileSync(__dirname + '/keys/spdy-key.pem'),

//     // // Fullchain file or cert file (prefer the former)
//     // cert: fs.readFileSync(__dirname + '/keys/spdy-fullchain.pem'),

//     // **optional** SPDY-specific options
//     spdy: {
//       protocols: ['h2', 'spdy/3.1', 'http/1.1'],
//       plain: false,

//       // **optional**
//       // Parse first incoming X_FORWARDED_FOR frame and put it to the
//       // headers of every request.
//       // NOTE: Use with care! This should not be used without some proxy that
//       // will *always* send X_FORWARDED_FOR
//       'x-forwarded-for': true,

//       connection: {
//         windowSize: 1024 * 1024, // Server's window size

//         // **optional** if true - server will send 3.1 frames on 3.0 *plain* spdy
//         autoSpdy31: false
//       }
//     }
//   }
// }

if (process.env.NODE_ENV === 'development-local' || process.env.SFS_USE_INTERNAL_SSL === 'no') {
  secureServerOptions = { name: 'Cpub' }
}

function loadMiddleware(server) {
  server.pre(restify.pre.sanitizePath())
  server.pre(restify.CORS({
    headers: ['Authorization', 'Accept-Encoding', 'Accept-Language', 'CPUB-Token']
  }))

  server.use(restify.gzipResponse())
  //server.use(restify.fullResponse())

//  TODO: Might want to change this
  // server.use(restify.throttle({
  //   burst: 10,
  //   rate: 5,
  //   ip: true
  // }));

  server.use(restify.dateParser())
  server.use(restify.queryParser())
  server.use(restify.bodyParser({ mapParams: false }))

  //server.use(middleware.loggerInjector())
  //server.use(middleware.libInjector())

  server.on('MethodNotAllowed', middleware.cors.unknownMethodHandler)


  let io = require('socket.io')(server.server, {transports: ['websocket']})
  // io.engine.ws = new (require('uws').Server)({
  //     noServer: true,
  //     perMessageDeflate: false
  // })
  
  io.on('connection', function (socket) {
    //logger.info('gateway::socket.io client connected =>', socket.id)
    socket.auth = false

    socket.on('authenticate', function (data) {
      let sessionToken = data.token

      redis.hget('session:'+request.headers['CPUB-Token'], 'user', (err, user) => {
        if(err) {
          return
        }
        if(user) {
          let user = JSON.parse(user)
          socket.auth = true
          socket.user = user
          socket.emit('authenticated')
        }
      })     
    })

    socket.on('subscribe', function (data) {
      if (data && data.sub && data.id) {
        if(data.sub=='rcon:channel') {
          socket.join(data.sub + ':' + data.id)
          redis.lrange('rcon:log:' + data.id, -20, -1, (err, logs) => {
            logs.forEach(log => {
              let obj = JSON.parse(log)
              socket.emit(data.sub+':'+data.id, obj)
            })
          })
        }
      }
    })

    socket.on('unsubscribe', function (data) {
      if (data && data.sub && data.id) {
        socket.leave(data.sub + ':' + data.id)
      }
    })

    setTimeout(function () {
      //If the socket didn't authenticate, disconnect it
      if (!socket.auth) {
        //logger.info("gateway::socket.io disconnecting socket ", socket.id)
        socket.emit('unauthorized')
        socket.disconnect('unauthorized')
      }
    }, 5000)
  })
  redis.on('message', (channel, message) => {
    if(channel=='rcon:channel') {
      let log = JSON.parse(message);
      io.sockets.in('rcon:channel:' + log.serverId).emit('rcon:channel:' + log.serverId, log)
    }
  })

  sub.subscribe("rcon:channel");

  server.io = io
}

let secureServer = null

secureServer = restify.createServer(secureServerOptions)
loadMiddleware(secureServer)

//  Set timeout to 1 minute
secureServer.server.setTimeout(60000)

let dbOptions = {
  db: { native_parser: true },
  server: {
    poolSize: 5,
    reconnectTries: Number.MAX_VALUE,
    socketOptions: {
      keepAlive: 1000,
      connectTimeoutMS: 30000
    }
  }
  // replset: {
  //   poolSize: 50,
  //   reconnectTries: Number.MAX_VALUE,
  //   socketOptions: {
  //     keepAlive: 1000,
  //     connectTimeoutMS: 30000
  //   }
  // },
}

if (process.env.NODE_ENV !== 'development-local') {
  dbOptions.user = process.env.MONGODB_USERNAME
  dbOptions.pass = process.env.MONGODB_PASSWORD
  dbOptions.auth = process.env.MONGODB_AUTHDB
}

db.createConnection(dbOptions)

module.exports = secureServer