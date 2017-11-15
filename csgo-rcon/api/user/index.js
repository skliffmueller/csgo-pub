'use strict'

const controller = require('./controller')
const redisSession = require('../../middleware/session')

function mount(server, options) {
  options.logger.info('mount::user')

  server.post({ path: '/user/create', version: '1.0.0' }, controller.create)
  server.post({ path: '/user/login', version: '1.0.0' }, controller.login)
  server.post({ path: '/user/me', version: '1.0.0' }, redisSession([],['user:read']), controller.update)
  server.get({ path: '/user/me', version: '1.0.0' }, redisSession([],['user:read']), controller.show)
}

module.exports = {
  mount: mount
}