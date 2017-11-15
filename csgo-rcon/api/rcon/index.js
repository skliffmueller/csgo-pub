'use strict'

const controller = require('./controller')
const redisSession = require('../../middleware/session')

function mount(server, options) {
  options.logger.info('mount::rcon')


  // Create rcon server
  /*
	{
		name:"blablabla",
		rconPassword:"",
		ip:"",
		port:27015,
		tags:[]
		//status:// ACTIVE, ERROR, IDLE, OFF
	}
  */
  server.post({ path: '/rcon/server', version: '1.0.0' }, /*redisSession(['admin'],['rcon:server:create']),*/ controller.createServer)


  // Create rcon server
  /*
	{
		name:"blablabla",
		rconPassword:"",
		ip:"",
		port:27015,
		tags:[]
		//status:// ACTIVE, ERROR, IDLE, OFF,
		gameServerStats: {
			// List of stuff from last server query
		}
	}
  */
  server.post({ path: '/rcon/server/:id/update', version: '1.0.0' }, /*redisSession(['admin'],['rcon:server:update']),*/ controller.updateServer)

  // Send rcon command
  /*
	{
		action:"single",
		exec:"command" or ["command", "command"]
	}
  */
  /*
	{
		action:"autoscript",
		exec:"id" or ["id","id"],
		fields:[{
			key:"",
			value:""
		}]
	}
  */
  server.post({ path: '/rcon/server/:id/send', version: '1.0.0' }, /*redisSession(['admin'],['rcon:server:update']),*/ controller.sendServerCommand)

  // get server status
  /*
	{
		name:"blablabla",
		rconPassword:"",
		ip:"",
		port:27015,
		tags:[]
		//status:// ACTIVE, ERROR, IDLE, OFF
	}
  */
  server.get({ path: '/rcon/server/:id/status', version: '1.0.0' }, /*redisSession(['admin'],['rcon:server:read']),*/ controller.serverStatus)




  // Create autoscript
  /*
	{
		name:"blablabla",
		description:"",
		tags:["","",""],
		exec:["","","",""]
	}
  */
  server.post({ path: '/rcon/auto', version: '1.0.0' }, /*redisSession(['admin'],['rcon:autoscript']),*/ controller.createAutoscript)


  // Update autoscript
  /*
	{
		name:"blablabla",
		description:"",
		tags:["","",""],
		exec:["","","",""]
	}
  */
  server.post({ path: '/rcon/auto/:id', version: '1.0.0' }, /*redisSession(['admin'],['rcon:autoscript']),*/ controller.updateAutoscript)


  // Update autoscript
  /*
	{
		tags=asd,asd,asd
		search=asdasdasd
	}
  */
  server.get({ path: '/rcon/auto', version: '1.0.0' }, /*redisSession(['admin'],['rcon:autoscript']),*/ controller.listAutoscripts)


  // Get autoscript
  /*
	{
		name:"blablabla",
		description:"",
		tags:["","",""],
		exec:["","","",""]
	}
  */
  server.get({ path: '/rcon/auto/:id', version: '1.0.0' }, /*redisSession(['admin'],['rcon:autoscript']),*/ controller.showAutoscript)
}

module.exports = {
  mount: mount
}