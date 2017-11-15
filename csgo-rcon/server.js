'use strict'

//if (process.env.NODE_ENV !== 'development-local') {
//  require('newrelic')
//}

let httpGlobalAgent = require('http').globalAgent
httpGlobalAgent.keepAlive = true
httpGlobalAgent.maxSockets = Infinity

let httsGlobalAgent = require('https').globalAgent
httsGlobalAgent.keepAlive = true
httsGlobalAgent.maxSockets = Infinity

const middleware = require('./middleware')
const logger = require('./lib/logger')
const server = require('./lib/server')
const router = require('./router')

let mountOptions = {
  logger: logger,
  sentinel: middleware.sentinel,
  session: middleware.session()
}

router.mount(server, mountOptions)

let PORT = process.env.PORT || 443
server.listen(PORT, () => {
  logger.info(`${server.name} listening at ${server.url} with environment ${process.env.NODE_ENV}`)
})