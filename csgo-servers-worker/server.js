'use strict'

const util = require('util')
const async = require('async')
const schedule = require('node-schedule')
const exec = util.promisify(require('child_process').exec)


const nats = require('./lib/nats')
const db = require('./lib/db')
const queueServer = require('./lib/queue')
const queueRouter = require('./queue')

queueRouter.mount(queueServer)

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

/*schedule.scheduleJob('*', () => { // Run every 5 minutes cron-tab style
  server.queue.push([{
    controller:'google',
    action:'getNearExpiredTokens',
    data:{message:'no data here'}
  }], (err) => {
    server.logger.info(err)
  })
})*/


const Servers = require('./models/servers')

nats.subscribe('servers::create', { 'queue': 'servers.worker' }, message => {
  Servers
    .findOne({
      _id:message
    })
    .then((server) => {
        queueServer.push([{
            controller:'server',
            action:'createContainer',
            data:server
        }], (err) => {
            console.log(err)
        })
    })
})

nats.subscribe('servers::modify', { 'queue': 'servers.worker' }, message => {
  let body = JSON.parse(message)
  /*
          let action = ""
          switch(body.status) {
              case 'START':
                  action = 'startContainer'
                  break;
              case 'PAUSE':
                  action = 'pauseContainer'
                  break;
              case 'UNPAUSE':
                  action = 'unpauseContainer'
                  break;
              case 'RESTART':
                  action = 'restartContainer'
                  break;
              case 'STOP':
                  action = 'stopContainer'
                  break;
              case 'REMOVE':
                  action = 'removeContainer'
                  break;
          }
          if(!action) {
              return;
          }
  */
  Servers.findOne({
        _id:body._id
      })
      .then((server) => {
          queueServer.push([{
              controller:'servers',
              action:'changeStateContainer',
              data:{
                server:server,
                state:body.status
              }
          }], (err) => {
              console.log(err)
          })
      })
})