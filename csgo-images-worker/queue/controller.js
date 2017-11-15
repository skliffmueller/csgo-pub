const Images = require('../models/images')
const imgfs = require('../lib/imgfs')
const nats = require('../lib/nats')

let controller = {}

let lastActionId = 0;

controller.createBase = (data, q, callback) => {
    let actionId = lastActionId++;
    let image = data
    // Need some sort of action id reference
    Images.update({
            _id:image._id
        },{
            $set:{
                status:'MOUNTED'
            }
        })
        .then((data) => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let imageBody = JSON.stringify({
                _id:image._id.toString(),
                status:'MOUNTED'
            })
            nats.publish('socket::images', imageBody)
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'loading', // loading, warning, error, success
                message:`Image '${image.name}' is being created`
            })
            nats.publish('socket::notifications', notBody)
            return imgfs.createEmptyImage(image.imagePath, image.imageSize)
        })
        .then((stdout, stderr) => {
            return Images.update({
                _id:image._id
            },{
                $set:{
                    status:'IDLE'
                }
            })
        })
        .then((data) => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let imageBody = JSON.stringify({
                _id:image._id,
                status:'IDLE'
            })
            nats.publish('socket::images', imageBody)
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'success', // loading, warning, error, success
                message:`Image '${image.name}' creation complete`
            })
            nats.publish('socket::notifications', notBody)
            callback()
        })
        .catch((err) => callback(err))
}

controller.createMerge = (data, q, callback) => {
    let actionId = lastActionId++;
    let ids = [data._id];
    let paths = [];
    let image = data;
    // Need some sort of action id reference

    ids.push.apply(ids, image.imageList.map((i) => {
        paths.push(i.imagePath)
        return i._id
    }))
    Images.update({
            _id:{$in:ids}
        },{
            $set:{
                status:'MOUNTED'
            }
        },{
            multi:true
        })
        .then((data) => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let imageBody = JSON.stringify({
                _id:ids,
                status:'MOUNTED'
            })
            nats.publish('socket::images', imageBody)
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'loading', // loading, warning, error, success
                message:`Image '${image.name}' is being created`
            })
            nats.publish('socket::notifications', notBody)

            return imgfs.createEmptyImage(image.imagePath, image.imageSize)
        })
        .then((stdout, stderr) => {
            return imgfs.mergeImages(image.imagePath, paths)
        })
        .then((stdout, stderr) => {
            return Images.update({
                _id:ids
            },{
                $set:{
                    status:'IDLE'
                }
            },{
                multi:true
            })
        })
        .then((data) => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let imageBody = JSON.stringify({
                _id:ids,
                status:'IDLE'
            })
            nats.publish('socket::images', imageBody)
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'success', // loading, warning, error, success
                message:`Image '${image.name}' creation complete`
            })
            nats.publish('socket::notifications', notBody)

            callback()
        })
        .catch((err) => {
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'error', // loading, warning, error, success
                message:`Image '${image.name}' creation error`,
                error:err
            })
            nats.publish('socket::notifications', notBody)

            callback(err)
        })
}

controller.createContainer = (data, q, callback) => {
    let actionId = lastActionId++;
    let newImage = data;
    let orgImage;
    // Need some sort of action id reference

    if(newImage.imageList.length!==1) {
        return callback('Must only contain one image');
    }
    orgImage = newImage.imageList[0]
    Images.update({
            _id:{
                $in:[
                    newImage._id,
                    orgImage._id
                ]
            }
        },{
            $set:{
                status:'MOUNTED'
            }
        },{
            multi:true
        })
        .then((data) => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let imageBody = JSON.stringify({
                _id:[
                    newImage._id,
                    orgImage._id
                ],
                status:'MOUNTED'
            })
            nats.publish('socket::images', imageBody)
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'loading', // loading, warning, error, success
                message:`Image '${newImage.name}' is being created`
            })
            nats.publish('socket::notifications', notBody)

            return imgfs.createEmptyImage(newImage.imagePath, newImage.imageSize)
        })
        .then((stdout, stderr) => {
            return imgfs.createContainerImage(orgImage.imagePath, newImage.imagePath)
        })
        .then((stdout, stderr) => {
            return Images.update({
                _id:[
                    newImage._id,
                    orgImage._id
                ]
            },{
                $set:{
                    status:'IDLE'
                }
            },{
                multi:true
            })
        })
        .then((data) => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let imageBody = JSON.stringify({
                _id:[
                    newImage._id,
                    orgImage._id
                ],
                status:'IDLE'
            })
            nats.publish('socket::images', imageBody)
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'success', // loading, warning, error, success
                message:`Image '${newImage.name}' creation complete`
            })
            nats.publish('socket::notifications', notBody)

            callback()
        })
        .catch((err) => {
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'error', // loading, warning, error, success
                message:`Image '${image.name}' creation error`,
                error:err
            })
            nats.publish('socket::notifications', notBody)

            callback(err)
        })
}

controller.steam = (data, q, callback) => {
    let actionId = lastActionId++;
    let image = data.image;
    let options = data.options;


    Images.update({
            _id:{
                $in:image._id
            }
        },{
            $set:{
                status:'STEAMCMD'
            }
        })
        .then((data) => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let imageBody = JSON.stringify({
                _id:image._id,
                status:'STEAMCMD'
            })
            nats.publish('socket::images', imageBody)
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'loading', // loading, warning, error, success
                message:`Image '${image.name}' is being updated with steamcmd`
            })
            nats.publish('socket::notifications', notBody)

            return imgfs.mountImage("/dev/nbd0", image.imagePath, options.installDir)
        })
        .then((stdout, stderr) => {
            return imgfs.runSteamCmd(options.config, options.installDir)
        })
        .then((stdout, stderr) => {
            console.log('whats up steam', stdout, stderr)
            return imgfs.unmountImage("/dev/nbd0")
        })
        .then((stdout, stderr) => {
            return Images.update({
                _id:image._id
            },{
                $set:{
                    status:'IDLE'
                }
            })
        })
        .then((data) => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let imageBody = JSON.stringify({
                _id:image._id,
                status:'IDLE'
            })
            nats.publish('socket::images', imageBody)
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'success', // loading, warning, error, success
                message:`Image '${image.name}' update complete`
            })
            nats.publish('socket::notifications', notBody)

            callback()
        })
        .catch((err) => {
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'error', // loading, warning, error, success
                message:`Image '${image.name}' steamcmd error`,
                error:err
            })
            nats.publish('socket::notifications', notBody)

            callback(err)
        })
}

controller.github = (data, q, callback) => {
    let actionId = lastActionId++;
}

controller.ftpStart = (data, q, callback) => {
    let actionId = lastActionId++
    let image = data.image

    Images.update({
        _id:image._id
    },{
        $set:{
            status:'FTP'
        }
    })
    .then((data) => {
        // socket announce 'image', '_id', {status:'MOUNTED'}
        let imageBody = JSON.stringify({
            _id:image._id,
            status:'FTP'
        })
        nats.publish('socket::images', imageBody)
        // socket announce 'notification',
        let notBody = JSON.stringify({
            id: actionId, // Some generated
            state:'loading', // loading, warning, error, success
            message:`Image '${image.name}' is loading ftp`
        })
        nats.publish('socket::notifications', notBody)

        return  imgfs.startFtpWithImagePath(image.imagePath)
    })
    .then((ftpProcess) => {
        // socket announce 'notification',
        let notBody = JSON.stringify({
            id: actionId, // Some generated
            state:'success', // loading, warning, error, success
            message:`Image '${image.name}' is an ftp server`
        })
        nats.publish('socket::notifications', notBody)
        callback()
    })
    .catch(err => {
        // socket announce 'notification',
        let notBody = JSON.stringify({
            id: actionId, // Some generated
            state:'error', // loading, warning, error, success
            message:`Image '${image.name}' ftp error`,
            error:err
        })
        nats.publish('socket::notifications', notBody)
        callback(err)
    })  
}

controller.ftpStop = (data, q, callback) => {
    let actionId = lastActionId++;
    let image = data.image

    imgfs.stopFtpWithImagePath()
        .then((data) => {
            return Images.update({
                    _id:image._id
                },{
                    $set:{
                        status:'IDLE'
                    }
                })
        })
        .then((data) => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let imageBody = JSON.stringify({
                _id:image._id,
                status:'IDLE'
            })
            nats.publish('socket::images', imageBody)
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'success', // loading, warning, error, success
                message:`Image '${image.name}' was detached from ftp`
            })
            nats.publish('socket::notifications', notBody)

            callback()
        })
        .catch(err => {
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'error', // loading, warning, error, success
                message:`Image '${image.name}' ftp error`,
                error:err
            })
            nats.publish('socket::notifications', notBody)
            callback(err)
        }) 
}

controller.mountStart = (data, q, callback) => {
    let actionId = lastActionId++;
    let image = data.image;

    let devPath = "/dev/nbd0"
    let dirPath = "/mnt/nbd0"

    Images.update({
        _id:image._id
    },{
        $set:{
            status:'MOUNTED'
        }
    })
    .then((data) => {
        // socket announce 'image', '_id', {status:'MOUNTED'}
        let imageBody = JSON.stringify({
            _id:image._id,
            status:'MOUNTED'
        })
        nats.publish('socket::images', imageBody)
        // socket announce 'notification',
        let notBody = JSON.stringify({
            id: actionId, // Some generated
            state:'loading', // loading, warning, error, success
            message:`Image '${image.name}' is loading mount point`
        })
        nats.publish('socket::notifications', notBody)

        return imgfs.mountImage(devPath, image.imagePath, dirPath)
    })
    .then((ftpProcess) => {
        // socket announce 'notification',
        let notBody = JSON.stringify({
            id: actionId, // Some generated
            state:'success', // loading, warning, error, success
            message:`Image '${image.name}' is now mounted`
        })
        nats.publish('socket::notifications', notBody)
        callback()
    })
    .catch(err => {
        // socket announce 'notification',
        let notBody = JSON.stringify({
            id: actionId, // Some generated
            state:'error', // loading, warning, error, success
            message:`Image '${image.name}' mount error`,
            error:err
        })
        nats.publish('socket::notifications', notBody)
        callback(err)
    }) 
}

controller.mountStop = (data, q, callback) => {
    let actionId = lastActionId++;
    let image = data.image

    let devPath = "/dev/nbd0"

    imgfs.unmountImage(devPath)
        .then((data) => {
            return Images.update({
                    _id:image._id
                },{
                    $set:{
                        status:'IDLE'
                    }
                })
        })
        .then((data) => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let imageBody = JSON.stringify({
                _id:image._id,
                status:'IDLE'
            })
            nats.publish('socket::images', imageBody)
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'success', // loading, warning, error, success
                message:`Image '${image.name}' was detached from mount`
            })
            nats.publish('socket::notifications', notBody)

            callback()
        })
        .catch(err => {
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'error', // loading, warning, error, success
                message:`Image '${image.name}' mount error`,
                error:err
            })
            nats.publish('socket::notifications', notBody)
            callback(err)
        }) 
}

module.exports = controller;