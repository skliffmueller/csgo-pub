'use strict'

const serverController = require('./controller-server')
const daemonController = require('./controller-daemon')
const autoscriptController = require('./controller-autoscript')

function mount(server) {
    // List servers for dashboard
    server.get({ path: '/servers', version: '1.0.0' }, serverController.index)
    // create server (requires image, and daemon)
    server.post({ path: '/servers', version: '1.0.0' }, serverController.create)
    // Base server information
    server.get({ path: '/servers/:id', version: '1.0.0' }, serverController.show)
    // Update basic details
    server.post({ path: '/servers/:id/details', version: '1.0.0' }, serverController.details)
    // Start container, Stop container, Restart container, Pause container, Unpause container
    server.post({ path: '/servers/:id/control', version: '1.0.0' }, serverController.control)
    // get console page
    server.get({ path: '/servers/:id/rcon', version: '1.0.0' }, serverController.getRcon)
    // send rcon command
    server.post({ path: '/servers/:id/rcon', version: '1.0.0' }, serverController.sendRcon)
    // Remove server
    server.post({ path: '/servers/:id/remove', version: '1.0.0' }, serverController.remove)

    // Get docker daemons
    server.get({ path: '/daemons', version: '1.0.0' }, daemonController.index)
    // Create deamon connection
    server.post({ path: '/daemons', version: '1.0.0' }, daemonController.create)
    // Details about daemon connection
    server.get({ path: '/daemons/:id', version: '1.0.0' }, daemonController.show)
    // This should trigger an update acrossed all servers
    server.post({ path: '/daemons/:id/update', version: '1.0.0' }, daemonController.update)
    // Remove connection, should update all servers
    server.post({ path: '/daemons/:id/remove', version: '1.0.0' }, daemonController.remove)

    // Get docker autoscripts
    server.get({ path: '/autoscripts', version: '1.0.0' }, autoscriptController.index)
    // Create autoscript
    server.post({ path: '/autoscripts', version: '1.0.0' }, autoscriptController.create)
    // Details about autoscript
    server.get({ path: '/autoscripts/:id', version: '1.0.0' }, autoscriptnController.show)

    server.post({ path: '/autoscripts/:id/update', version: '1.0.0' }, autoscriptController.update)
    // Remove autoscript
    server.post({ path: '/autoscripts/:id/remove', version: '1.0.0' }, autoscriptController.remove)
}

module.exports = {
  mount: mount
}