'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.set('debug', process.env.MONGDB_DEBUG || false)

let dbOptions =  null
let timeToRetryConnection = 5*1000 // 5 seconds
let reconnectInterval = null

mongoose.connection.on('connected', () => {
  clearReconnectTimer()
})

mongoose.connection.on('disconnected', () => {
  mongoose.connection.close()
    .then(() => {
      createReconnectTimer()
    })
    .catch(error => {

    })
})

mongoose.connection.on('error', (error) => {
  mongoose.connection.close()
    .then(() => {
      createReconnectTimer()
    })
    .catch(error => {

    })
})

function createConnection(options) {
  dbOptions = options || {}
  connect(dbOptions)
}

function connect(opts) {
  mongoose.connect(process.env.MONGODB_CONNECTION_STRING, opts)
}

function clearReconnectTimer() {
  if(reconnectInterval != null) {
    clearTimeout(reconnectInterval)
    reconnectInterval = null;
  }
}

function createReconnectTimer() {
  if ( reconnectInterval == null) { // Multiple Error Events may fire, only set one connection retry.
    reconnectInterval =
      setTimeout(function () {
        clearReconnectTimer()
        connect(dbOptions)
      }, timeToRetryConnection)
  }
}

module.exports = {
  createConnection
}