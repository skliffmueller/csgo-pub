'use strict'

let httpGlobalAgent = require('http').globalAgent
httpGlobalAgent.keepAlive = true
httpGlobalAgent.maxSockets = Infinity

let httsGlobalAgent = require('https').globalAgent
httsGlobalAgent.keepAlive = true
httsGlobalAgent.maxSockets = Infinity

const logger = require('./lib/logger')
const server = require('./lib/server')

const nats = require('./lib/nats')

nats.subscribe('socket::notifications', function(msg) {
	let body = JSON.parse(msg)
	server.io.sockets.in('notifications').emit('notifications', body)
})

nats.subscribe('socket::images', function(msg) {
	let body = JSON.parse(msg)
	server.io.sockets.in('images').emit('images', body)
})

nats.subscribe('socket::servers', function(msg) {
	let body = JSON.parse(msg)
	server.io.sockets.in('servers').emit('servers', body)
})