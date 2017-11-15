'use strict'

const serverModel = require('../../models/servers')

//const config = require('config')
//const restify = require('restify')

/*function create(request, response, next) {
  request.models.App
    .create(request.body)
    .then(app => {
      return response.json(201, app)
    })
    .catch(error => {
      request.logger.error('apps::create => %j', error)
      request.libs.sfserror.handleError(response, error, next)
    })
}

function show(request, response, next) {
  request.models.App
    .find({ _id: request.params.id })
    .limit(1)
    .lean()
    .exec()
    .then(apps => {
      if (apps.length === 0) {
        request.logger.info('apps::show - Did not find app')
        return next(new restify.ResourceNotFoundError('App not found.'))
      }
      let app = apps[0]
      return response.json(200, app)
    })
    .catch(error => {
      request.logger.error('apps::show => %j', error)
      request.libs.sfserror.handleError(response, error, next)
    })
}

function index(request, response, next) {
  request.models.App
    .find(request.query)
    .lean()
    .exec()
    .then(apps => {
      let appObjects = apps.map(app => {
        return app
      })
      return response.json(200, apps)
    })
    .catch(error => {
      request.logger.error('apps::index => %j', error)
      request.libs.sfserror.handleError(response, error, next)
    })
}

function update(request, response, next) {
  if (request.body === undefined) {
    return next(new restify.ResourceNotFoundError('POST body missing'))
  }

  request.models.App
    .find({ _id: request.params.id })
    .limit(1)
    .then((apps) => {
      if (apps.length === 0) {
        return next(new restify.ResourceNotFoundError('App not found.'))
      }

      let app = apps[0]
      app.set(request.body)
      return app.save()
    })
    .then(app => {
      return response.json(200, app)
    })
    .catch(error => {
      request.logger.error('apps::update => %j', error)
      request.libs.sfserror.handleError(response, error, next)
    })
}

function key(request, response, next) {
  request.models.App
    .find({ key: request.params.key })
    .limit(1)
    .lean()
    .exec()
    .then(apps => {
      if (apps.length === 0) {
        return next(new restify.ResourceNotFoundError('App not found.'))
      }
      let app = apps[0]
      return response.json(200, app)
    })
    .catch((error) => {
      request.logger.error('apps::key => %j', error)
      request.libs.sfserror.handleError(response, error, next)
    })
}*/
function createServer(request, reponse) {
  serverModel
    .create(request.body)
    .then(server => {
      return response.json(201, server)
    })
    .catch(error => {
      console.log('error')
      next(error)
    })
}

function updateServer(request, reponse) {
  serverModel
    .findOneAndUpdate({
      _id:request.params.id
    },{
      $set:request.body
    })
    .then(server => {
      return response.json(200, server)
    })
    .catch(error => {
      console.log('error')
      next(error)
    })
}

function sendServerCommand(request, reponse) {

  serverModel
    .findOneById(request.params.id)
    .lean()
    .exec()
    .then(server => {
      if(!server) {
        response.send(404)
        return;
      }
      if(server.status!=='ACTIVE') {
        response.json(400, {error:true, message:"server status is not active"})
        return;
      }

      return new Promise((resolve, reject) => {
        redis.hexists('rcon:servers', server._id, (err, res) => {
          if(err || !res) {
            response.json(500, {error:true, message:"redis error", stack:err})
            return
          }
          if(!res) {
            response.json(400, {error:true, message:"server socket is not active"})
            return
          }
          resolve(server)
        });
      })

    })
    .then((server) => {
        
      return new Promise((resolve, reject) => {
        let conn = new Rcon(
              server.ip,
              server.port,
              server.rconPassword,
              {
                tcp: true,
                challenge: false
              }
        );

        conn.on('auth', () => {
          console.log('got auth')
          conn.send(request.body.command)
        })
        conn.on('response', (str) => {
          console.log('got response', str)
          conn.disconnect()
        })
        conn.on('end', () => {
          response.json(200, server)
        });

        conn.connect();
      })
    })
    .catch(error => {
      console.log('error')
      next(error)
    })
}

function serverStatus(request, reponse) {

  let mongoServerRecord = null
  let redisServerRecord = null

  serverModel
    .findOneById(request.params.id)
    .lean()
    .exec()
    .then(server => {
      if(!server) {
        response.send(404)
        return;
      }

      mongoServerRecord = server;

      return new Promise((resolve, reject) => {
        redis.hexists('rcon:servers', server._id, (err, res) => {
          if(err) {
            response.json(500, {error:true, message:"redis error", stack:err})
            return
          }
          resolve(res)
        });
      })

    })
    .then((server) => {
      redisServerRecord = server;
      
      return new Promise((resolve, reject) => {
        let conn = new Rcon(
              server.ip,
              server.port,
              server.rconPassword,
              {
                tcp: true,
                challenge: false
              }
        );

        conn.on('auth', () => {
          console.log('got auth')
          conn.send(request.body.command)
        })
        conn.on('response', (str) => {
          console.log('got response', str)
          let log = {
            serverId:server._id,
            source:"scds",
            line:str,
            createdAt:new Date().toISOString()
          }
          let jsonString = JSON.stringify(log)
          redis.rpush('rcon:log:'+server._id, jsonString)
          redis.publish('rcon:channel', jsonString)
          conn.disconnect()
        })
        conn.on('end', () => {
          console.log('end?')
          redis.hdel('rcon:servers', server._id)
          response.json(200, server)
        });

        conn.connect();
      })
    })
    .catch(error => {
      console.log('error')
      next(error)
    })
}

function createAutoscript(request, reponse) {

}

function updateAutoscript(request, reponse) {

}

function listAutoscript(request, reponse) {

}

function showAutoscript(request, reponse) {

}


module.exports = {
  createServer: createServer,
  updateServer: updateServer,
  sendServerCommand: sendServerCommand,
  serverStatus: serverStatus,
  createAutoscript: createAutoscript,
  updateAutoscript: updateAutoscript,
  listAutoscript: listAutoscript,
  showAutoscript: showAutoscript
}