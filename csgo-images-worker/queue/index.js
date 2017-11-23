'use strict'
const controller = require('./controller')

exports.mount = (server) => {
  server.mount('image', 'createBase', controller.createBase)
  server.mount('image', 'createMerge', controller.createMerge)
  server.mount('image', 'createContainer', controller.createContainer)

  // server.mount('image', 'steamCmdImage', controller.steam)
  // server.mount('image', 'githubImage', controller.github)

  // server.mount('image', 'ftpImageStart', controller.ftpStart)
  // server.mount('image', 'ftpImageStop', controller.ftpStop)

  server.mount('image', 'mountImage', controller.mount)
  server.mount('image', 'unmountImage', controller.unmount)
}