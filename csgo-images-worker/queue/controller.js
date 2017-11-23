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

// controller.steam = (data, q, callback) => {
//     let actionId = lastActionId++;
//     let image = data.image;
//     let options = data.options;


//     Images.update({
//             _id:{
//                 $in:image._id
//             }
//         },{
//             $set:{
//                 status:'STEAMCMD'
//             }
//         })
//         .then((data) => {


//             return imgfs.mountImage("/dev/nbd0", image.imagePath, options.installDir)
//         })
//         .then((stdout, stderr) => {
//             // socket announce 'image', '_id', {status:'MOUNTED'}
//             let imageBody = JSON.stringify({
//                 _id:image._id,
//                 status:'STEAMCMD'
//             })
//             nats.publish('socket::images', imageBody)
//             // socket announce 'notification',
//             let notBody = JSON.stringify({
//                 id: actionId, // Some generated
//                 state:'loading', // loading, warning, error, success
//                 message:`Image '${image.name}' is being updated with steamcmd`
//             })
//             nats.publish('socket::notifications', notBody)
//             return imgfs.runSteamCmd(image.imagePath, options.config)
//         })
//         .then((stdout, stderr) => {
//             return Images.update({
//                 _id:image._id
//             },{
//                 $set:{
//                     status:'IDLE'
//                 }
//             })
//         })
//         .then((data) => {
//             // socket announce 'image', '_id', {status:'MOUNTED'}
//             let imageBody = JSON.stringify({
//                 _id:image._id,
//                 status:'IDLE'
//             })
//             nats.publish('socket::images', imageBody)
//             // socket announce 'notification',
//             let notBody = JSON.stringify({
//                 id: actionId, // Some generated
//                 state:'success', // loading, warning, error, success
//                 message:`Image '${image.name}' update complete`
//             })
//             nats.publish('socket::notifications', notBody)

//             callback()
//         })
//         .catch((err) => {
//             // socket announce 'notification',
//             let notBody = JSON.stringify({
//                 id: actionId, // Some generated
//                 state:'error', // loading, warning, error, success
//                 message:`Image '${image.name}' steamcmd error`,
//                 error:err
//             })
//             nats.publish('socket::notifications', notBody)

//             callback(err)
//         })
// }

controller.github = (data, q, callback) => {
    let actionId = lastActionId++;
}

controller.mount = (data, q, callback) => {
    let actionId = lastActionId++;
    let image = data.image;
    let dev;

    // socket announce 'notification',
    let notBody = JSON.stringify({
        id: actionId, // Some generated
        state:'loading', // loading, warning, error, success
        message:`Image '${image.name}' is loading mount point`
    })
    nats.publish('socket::notifications', notBody)

    imgfs.mountImage(image.imagePath)
        .then(d => {
            dev = d
            return Images.update({
                    _id:image._id
                },{
                    $set:{
                        status:'MOUNTED',
                        dev:dev
                    }
                })
        })
        .then((data) => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let imageBody = JSON.stringify({
                _id:image._id,
                status:'MOUNTED',
                dev:dev
            })
            nats.publish('socket::images', imageBody)

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

controller.unmount = (data, q, callback) => {
    let actionId = lastActionId++;
    let image = data.image;
    let dev;

    // socket announce 'notification',
    let notBody = JSON.stringify({
        id: actionId, // Some generated
        state:'loading', // loading, warning, error, success
        message:`Image '${image.name}' is being unmounted from filesystem`
    })
    nats.publish('socket::notifications', notBody)

    imgfs.unmountImage(image.dev.devPath)
        .then(d => {
            dev = d
            return Images.update({
                    _id:image._id
                },{
                    $set:{
                        status:'IDLE',
                        dev:dev
                    }
                })
        })
        .then((data) => {
            // socket announce 'image', '_id', {status:'MOUNTED'}
            let imageBody = JSON.stringify({
                _id:image._id,
                status:'IDLE',
                dev:dev
            })
            nats.publish('socket::images', imageBody)

            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'success', // loading, warning, error, success
                message:`Image '${image.name}' is now unmounted`
            })
            nats.publish('socket::notifications', notBody)
            callback()
        })
        .catch(err => {
            // socket announce 'notification',
            let notBody = JSON.stringify({
                id: actionId, // Some generated
                state:'error', // loading, warning, error, success
                message:`Image '${image.name}' unmount error`,
                error:err
            })
            nats.publish('socket::notifications', notBody)
            callback(err)
        })
}

module.exports = controller;