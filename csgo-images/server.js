'use strict'

// if (process.env.NODE_ENV !== 'development-local') {
//   require('newrelic')
// }

const restify = require('restify')

const nats = require('./lib/nats');
const db = require('./lib/db')

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


let httpGlobalAgent = require('http').globalAgent
httpGlobalAgent.maxSockets = Infinity

let httsGlobalAgent = require('https').globalAgent
httsGlobalAgent.maxSockets = Infinity

const router = require('./router')

let serverOptions = { name: 'Cpub' }

let server = restify.createServer(serverOptions)

server.pre(restify.pre.sanitizePath())

server.use(restify.plugins.acceptParser(['Authorization', 'Accept-Encoding', 'Accept-Language']))

server.use(restify.plugins.gzipResponse())

server.use(restify.plugins.dateParser())
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser({ mapParams: false }))

router.mount(server)

let port = process.env.PORT || 8002
server.listen(port, () => {
    console.log('Server is now running')
})


