'use strict'

const redis = require('./lib/redis')

redis.on('ready', () => {
	main()
})



function main() {
	redis.on('message', (channel, message) => {
		console.log('redis got message', channel, message)
	  /*if(channel=='rcon:channel') {
	    let log = JSON.parse(message);
	    io.sockets.in('rcon:channel:' + log.serverId).emit('rcon:channel:' + log.serverId, log)
	  }*/
	})
  redis.subscribe('rcon:channel')
	/*setInterval(() => {
		let obj = {
			test:'name',
			date:new Date().toISOString()
		}
		let jsonString = JSON.stringify(obj)
    redis.publish('rcon:channel', jsonString)

	}, 5000)*/
}
