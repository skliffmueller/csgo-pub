'use strict'

const api = require('./api')

exports.mount = (server) => {
  api.mount(server)
}