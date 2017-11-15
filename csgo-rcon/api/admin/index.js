'use strict'

const controller = require('./controller')
const redisSession = require('../../middleware/session')

function mount(server, options) {
  options.logger.info('mount::admin')

  server.post({ path: '/admin/create', version: '1.0.0' }, redisSession(['admin'],['admin:create']), controller.create)
  // Call this after user login, will create admin sessin to access admin apis
  server.post({ path: '/admin/login', version: '1.0.0' }, redisSession(['admin'],['admin:login']), controller.login)
  server.post({ path: '/admin/:id', version: '1.0.0' }, redisSession(['admin'],['admin:update']), controller.update)
  server.get({ path: '/admin/:id', version: '1.0.0' }, redisSession(['admin'],['admin:read']), controller.show)
}

module.exports = {
  mount: mount
}