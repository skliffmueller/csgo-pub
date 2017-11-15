'use strict'

const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.set('debug', process.env.MONGDB_DEBUG || false)

let dbOptions =  null
let timeToRetryConnection = 5*1000 // 5 seconds
let reconnectInterval = null

mongoose.connection.on('connected', () => {
  console.log('mongoose:: connected to MongoDB successfully.')
  clearReconnectTimer()
})

mongoose.connection.on('disconnected', () => {
  console.log('mongoose::disconnected:: disconnected from MongoDB successfully.')
  mongoose.connection.close()
    .then(() => {
      console.log('mongoose::disconnected:: MongoDB connection closed successfully.')
      createReconnectTimer()
    })
    .catch(error => {
      console.log('mongoose::disconnected:: could not close MongoDB connection due to an error ', error)
    })
})

mongoose.connection.on('error', (error) => {
  console.log('mongoose::error:: could not connect to MongoDB due to an error: ', error)
  mongoose.connection.close()
    .then(() => {
      console.log('mongoose::error:: MongoDB connection closed successfully.')
      createReconnectTimer()
    })
    .catch(error => {
      console.log('mongoose::error:: could not close MongoDB connection due to an error ', error)
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
    console.log("mongoose::clearReconnectTimer:: MongoDB clearing reconnect timer.");
    clearTimeout(reconnectInterval)
    reconnectInterval = null;
  }
}

function createReconnectTimer() {
  if ( reconnectInterval == null) { // Multiple Error Events may fire, only set one connection retry.
    reconnectInterval =
      setTimeout(function () {
        console.log("mongoose::createReconnectTimer:: MongoDB reconnect timer is called.");
        clearReconnectTimer()
        connect(dbOptions)
      }, timeToRetryConnection)
  }
}

module.exports = {
  createConnection: createConnection
}