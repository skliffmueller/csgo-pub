'use strict'

const restify = require('restify')
const Rcon = require('rcon')
const Autoscripts = require('../models/autoscripts')
const Servers = require('../models/servers')
const Daemons = require('../models/daemons')

const nats = require('../lib/nats')
const redis = require('../lib/redis')

function index(req, res, next) {
    let query = {}

    if(req.query.status && typeof req.query.status == 'string') {
        query.status = req.query.status
    }
    if(req.query.tags && typeof req.query.tags == 'string') {
        query.tags = {$in:req.query.tags.split(',')}
    }
    if(req.query.daemonId && typeof req.query.daemonId == 'string') {
        query['daemon._id'] = req.query.daemonId
    }
    if(req.query.imageId && typeof req.query.imageId == 'string') {
        query['image._id'] = req.query.imageId
    }
    Servers.find(query)
            .sort({
                status:-1
            })
            .exec()
            .then(servers => {
                res.json(200, servers)
            })
            .catch(err => {
                res.json(400, err)
            })
}

function create(req, res, next) {
    Daemons
        .findOne({
            _id:req.body.daemonId
        })
        .then((daemon) => {
            if(daemon) {
                return new Servers({
                    tags:req.body.tags,
                    deploymentConfig:req.body.deploymentConfig,
                    daemon:daemon,
                    image:req.body.image
                }).save()
            } else {
                res.json(400, {message:"Daemon does not exist."})
            }
        })
        .then((server) => {
            nats.publish('servers::create', server._id.toString())
            res.json(201, server)
        })
        .catch(err => {
            res.json(400, err)
        })
}

function show(req, res, next) {
    Servers
        .findOne({
            _id: req.params.id
        })
        .lean()
        .then(server => res.json(200, server))
        .catch(err => res.json(400, err))
}

function details(req, res, next) {
    let set = {}
    if(req.body.tags) {
        set.tags = req.body.tags
    }
    if(req.body.deploymentConfig) {
        set.deploymentConfig = req.body.deploymentConfig
    }
    if(req.body.image) {
        set.image = req.body.image
    }
    Servers
        .findOneAndUpdate({
            _id: req.params.id
        },{
            $set:set
        },{
            new: true
        })
        .then(server => res.json(200, server))
        .catch(err => res.json(400, err))
}

function control(req, res, next) {
    /*
    nats: servers::modify
    {
        _id:server,
        status: // START, RESTART, STOP, PAUSE, UNPAUSE
    }
    */
    Servers
        .findOne({
            _id: req.params.id
        })
        .lean()
        .then(server => {
            let body = JSON.stringify({
                _id:server._id,
                status:req.body.status
            })
            nats.publish('servers::modify', body)
            res.json(200, server)
        })
        .catch(err => res.json(400, err))
}

function recreate(req, res, next) {
    /*
    nats: servers::recreate
    {
        _id:server
    }
    */
    Servers
        .findOne({
            _id: req.params.id
        })
        .lean()
        .then(server => {
            nats.publish('servers::recreate', server._id.toString())
            res.json(200, server)
        })
        .catch(err => res.json(400, err))
}

function getRcon(req, res, next) {

}

function sendRcon(req, res, next) {
    Servers
    .findOne({
        _id:request.params.id
    })
    .lean()
    .exec()
    .then(server => {
      if(!server) {
        response.send(404)
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

function autoscript(req, res, next) {

}

function remove(req, res, next) {

}

/*function redis(req, res, next) {

    // Make aggreg
}*/

module.exports = {
  index,
  create
}