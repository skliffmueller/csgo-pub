'use strict'

const accounts = require('./accounts')
const servers = require('./servers')
const images = require('./images')
const autoscripts = require('./autoscripts')

function mount(server, options) {

  options.logger.info('mount::api::1.0.0')

  accounts.mount(server, options)
  servers.mount(server, options)
  images.mount(server, options)
  autoscripts.mount(server, options)
}

module.exports = {
  mount: mount
}
