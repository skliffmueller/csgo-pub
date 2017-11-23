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

const Images = require('./models/images')

nats.subscribe('image::create', { 'queue': 'image.worker' }, message => {
    Images.findOne({
          _id:message
        })
        .then((image) => {
            let action = ""
            switch(image.type) {
                case 'BASE':
                    action = 'createBase'
                    break;
                case 'MERGE':
                    action = 'createMerge'
                    break;
                case 'CONTAINER':
                    action = 'createContainer'
                    break;
            }
            if(!action) {
                return;
            }
            queueServer.push([{
                controller:'image',
                action:action,
                data:image
            }], (err) => {
                console.log(err)
            })
        })
})

nats.subscribe('image::mount', { 'queue': 'image.worker' }, message => {
    let body = JSON.parse(message)
    Images.findOne({
          _id:body._id
        })
        .then((image) => {
            let action = ""
            if(image.status!=='IDLE') {
              // Handle error some how ?
              return;
            }
            body.image = image
            queueServer.push([{
                controller:'image',
                action:'mountImage',
                data:body
            }], (err) => {
                console.log(err)
            })
        })
  })

nats.subscribe('image::unmount', { 'queue': 'image.worker' }, message => {
let body = JSON.parse(message)
Images.findOne({
        _id:body._id
    })
    .then((image) => {
        let action = ""
        if(image.status!=='IDLE') {
            // Handle error some how ?
            return;
        }
        body.image = image
        queueServer.push([{
            controller:'image',
            action:'unmountImage',
            data:body
        }], (err) => {
            console.log(err)
        })
    })
})

//   nats.subscribe('image::modify', { 'queue': 'image.worker' }, message => {
//     let body = JSON.parse(message)
//     Images.findOne({
//           _id:body._id
//         })
//         .then((image) => {
//             let action = ""
//             if(image.status!=='IDLE') {
//               // Handle error some how ?
//               return;
//             }
//             switch(body.status) {
//                 case 'FTP':
//                     action = 'ftpImageStart'
//                     break;
//                 case 'STEAMCMD':
//                     action = 'steamCmdImage'
//                     break;
//                 case 'GITHUB':
//                     action = 'githubImage'
//                     break;
//                 case 'MOUNTED':
//                     action = 'mountImageStart'
//                     break;
//             }
//             if(!action) {
//                 return;
//             }
//             body.image = image
//             queueServer.push([{
//                 controller:'image',
//                 action:action,
//                 data:body
//             }], (err) => {
//                 console.log(err)
//             })
//         })
//   })

/*nats.subscribe('image::done', { 'queue': 'image.worker' }, message => {
  Images.findOne({
        _id:message
      })
      .then((image) => {
          let action = ""
          switch(image.status) {
              case 'FTP':
                  action = 'ftpImageStop'
                  break;
              case 'MOUNTED':
                  action = 'mountImageStop'
                  break;
          }
          if(!action) {
              return;
          }
          body.image = image
          queueServer.push([{
              controller:'image',
              action:action,
              data:body
          }], (err) => {
              console.log(err)
          })
      })
})*/

nats.subscribe('socket::notifications', { 'queue': 'image.worker' }, message => {
  console.log(message)
})