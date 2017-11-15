'use strict'
const controller = require('./controller')

exports.mount = (server) => {
  server.mount('servers', 'createContainer', controller.createContainer)
  server.mount('servers', 'changeStateContainer', controller.changeStateContainer)
  server.mount('servers', 'removeContainer', controller.removeContainer)
}