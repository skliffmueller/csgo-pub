'use strict'

const util = require('util')
const nats = require('nats')

let server = null

if (process.env.NATS_CONNECTION_URI === undefined) {
  module.exports = null
  return
}

server = nats.connect(
  {
    'uri': process.env.NATS_CONNECTION_URI,
    'waitOnFirstConnect': true,
	'reconnectTimeWait': 100,
    'maxReconnectAttempts': 20
  }
)

server.on('connect', client => {
  console.log('nats: connected successfully...')
})

server.on('error', error => {
  console.log(`nats: error occured => ${util.inspect(error)}`)
})

module.exports = server