'use strict'

const admin = require('./admin')
const rcon = require('./rcon')

function mount(server, options) {

  options.logger.info('mount::api')

  admin.mount(server, options)
  rcon.mount(server, options)
}

module.exports = {
  mount: mount
}
