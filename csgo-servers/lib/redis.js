'use strict'

const redis = require('redis')

const redisClient = redis.createClient(process.env.REDIS_PORT || 6379, process.env.REDIS_HOST || '192.168.99.100')
if (process.env.REDIS_PASSWORD) {
  redisClient.auth(process.env.REDIS_PASSWORD)
}  

redisClient.on('ready', () => {
  console.log('Redis Cache Client connected and ready.')
})

redisClient.on("error", err => {
  console.log(`Redis Cache Client Error: ${err}`)
})

module.exports = redisClient