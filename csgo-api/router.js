'use strict'

let api = require('./api')

exports.mount = (server, options) => {

  server.get('/', (request, response, next) => {
    return response.send(200, 'Hello')
  });

  api.mount(server, options)
}