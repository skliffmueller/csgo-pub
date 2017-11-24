const Servers = require('../models/servers')
const Docker = require('dockerode');
const nats = require('../lib/nats')

let controller = {}

let lastActionId = 0;

controller.createContainer = (data, q, callback) => {
    let actionId = lastActionId++;
    let server = data
    let container
    let info
    // Need some sort of action id reference

    // socket announce 'notification',
    let notBody = JSON.stringify({
        id: actionId, // Some generated
        state:'loading', // loading, warning, error, success
        message:`Server '${server.name}' is being created`
    })
    nats.publish('socket::notifications', notBody)

    let docker = new Docker(server.daemon.config)
    docker
        .createContainer(server.deploymentConfig)
        .then(c => {
            container = c
            return container.inspect()
        })
        .then(cInfo => {
            console.log('cInfo', cInfo)
            if(Array.isArray(cInfo)) {
                if(cInfo.length) {
                    info = cInfo[0]
                }
            } else {
                info = cInfo
            }
            if(!info) {
                return Promise.reject();
            }
            return Servers
                    .update({
                        _id:server._id
                    },{
                        $set:{
                            container:info
                        }
                    })
        })
        .then(d => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let serverBody = JSON.stringify({
                _id:server._id.toString(),
                container:info
            })
            nats.publish('socket::servers', serverBody)

            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'success', // loading, warning, error, success
                message:`Server '${server.name}' creation complete`
            })
            nats.publish('socket::notifications', notBody)
            callback()
        })
        .catch(err => {
            console.log(err)
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'error', // loading, warning, error, success
                message:`Server '${server.name}' creation failed`
            })
            nats.publish('socket::notifications', notBody)
            callback()
        })
}

controller.changeStateContainer = (data, q, callback) => {
    let actionId = lastActionId++;
    let server = data.server
    let state = data.state
    let info
    
    let states = {
        'START':{
            loading:`Server '${server.name}' is being started`,
            success:`Server '${server.name}' started successfully`,
            error:`Server '${server.name}' start error`
        },
        'PAUSE':{
            loading:`Server '${server.name}' is being paused`,
            success:`Server '${server.name}' paused successfully`,
            error:`Server '${server.name}' pause error`
        },
        'UNPAUSE':{
            loading:`Server '${server.name}' is being unpaused`,
            success:`Server '${server.name}' unpaused successfully`,
            error:`Server '${server.name}' unpause error`
        },
        'RESTART':{
            loading:`Server '${server.name}' is being restarted`,
            success:`Server '${server.name}' restart successfully`,
            error:`Server '${server.name}' restart error`
        },
        'STOP':{
            loading:`Server '${server.name}' is being stopped`,
            success:`Server '${server.name}' stopped successfully`,
            error:`Server '${server.name}' stop error`
        }
    }

    // socket announce 'notification',
    let notBody = JSON.stringify({
        id: actionId, // Some generated
        state:'loading', // loading, warning, error, success
        message:states[state].loading
    })
    nats.publish('socket::notifications', notBody)
    let docker = new Docker(server.daemon.config)
    let container = docker.getContainer(server.container.Id)
    switch(body.status) {
        case 'START':
            let promise = container.start()
        case 'PAUSE':
            let promise = container.pause()
        case 'UNPAUSE':
            let promise = container.unpause()
        case 'RESTART':
            let promise = container.restart()
        case 'STOP':
            let promise = container.stop()
    }
    promise
        .then(data => {
            return container.inspect()
        })
        .then(cInfo => {
            if(Array.isArray(cInfo)) {
                if(cInfo.length) {
                    info = cInfo[0]
                }
            } else {
                info = cInfo
            }
            if(!info) {
                return Promise.reject();
            }
            return Servers
                    .update({
                        _id:server._id
                    },{
                        $set:{
                            container:info
                        }
                    })
        })
        .then(d => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let serverBody = JSON.stringify({
                _id:server._id.toString(),
                container:info
            })
            nats.publish('socket::servers', serverBody)

            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'success', // loading, warning, error, success
                message:states[state].success
            })
            nats.publish('socket::notifications', notBody)
            callback()
        })
        .catch(err => {
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'error', // loading, warning, error, success
                message:states[state].error
            })
            nats.publish('socket::notifications', notBody)
            callback()
        })
}

controller.removeContainer = (data, q, callback) => {
    let actionId = lastActionId++;
    let server = data
    let container
    let info

    // socket announce 'notification',
    let notBody = JSON.stringify({
        id: actionId, // Some generated
        state:'loading', // loading, warning, error, success
        message:`Server '${server.name}' is being removed`
    })
    nats.publish('socket::notifications', notBody)

    let docker = new Docker(server.daemon.config)
    docker
        .getContainer(server.container.Id)
        .then(c => {
            container = c
            return container.remove()
        })
        .then(c => {
            return Servers.deleteOne({
                _id:server._id
            })
        })
        .then(d => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let serverBody = JSON.stringify({
                _id:server._id.toString(),
                _remove:true
            })
            nats.publish('socket::servers', serverBody)

            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'success', // loading, warning, error, success
                message:`Server '${server.name}' has been removed`
            })
            nats.publish('socket::notifications', notBody)
            callback()
        })
        .catch(err => {
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'error', // loading, warning, error, success
                message:`Server '${server.name}' removal error`
            })
            nats.publish('socket::notifications', notBody)
            callback()
        })
}

module.exports = controller;