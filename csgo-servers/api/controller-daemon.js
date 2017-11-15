'use strict'

const restify = require('restify')
const Autoscripts = require('../models/autoscripts')
const Servers = require('../models/servers')
const Daemons = require('../models/daemons')
const nats = require('../lib/nats')

function index(req, res, next) {
    Daemons.find()
                .sort({
                    status:-1
                })
                .then(daemons => {
                    res.json(200, daemons)
                })
                .catch(err => {
                    res.json(400, err)
                })
    // let query = {}
    // if(!req.query.showDeleted) {
    //     query['versionStatus'] = {$ne:'DELETED'}
    // }
    // Images.find(query)
    //         .sort({
    //             name:-1,
    //             version:-1
    //         })
    //         .exec()
    //         .then((images) => {
    //             res.json(200, images)
    //         })
}

function create(req, res, next) {
    var daemon = new Daemons({
        name:req.body.name,
        config:req.body.config,
        registry:req.body.registry,
        status:'VERIFYING'
    })
    daemon.save()
            .then(daemon => {
                res.json(201, daemon)
            })
            .catch(err => {
                res.json(400, err)
            })
    // var image = new Images({
    //     name:req.body.name,
    //     type:req.body.type,
    //     imageSize:req.body.imageSize,
    //     versionStatus:req.body.versionStatus,
    //     version:req.body.version,
    //     uniqueName:req.body.uniqueName,
    //     containerId:"",
    //     imageList:req.body.imageList,
    //     status:'IDLE'
    // })
    // image.imagePath = `/var/images/${image._id}.qcow2`

    // image.save()
    //     .then((image) => {
    //         nats.publish('image::create', image._id.toString())
    //         res.json(201, image)
    //     })
}

function show(req, res, next) {
    Daemons.findOne({
                _id: req.params.id
            })
            .lean()
            .then(daemon => {
                res.json(200, daemon)
            })
            .catch(err => {

            })
}

function update(req, res, next) {
    let set = {}
    let daemon;
    if(req.body.name) {
        set.name = req.body.name
    }
    if(req.body.config) {
        set.config = req.body.config
    }
    if(req.body.registry) {
        set.registry = req.body.registry
    }
    Daemons.findOneAndUpdate({
                _id: req.params.id
            },{
                $set:set
            },{
                new:true
            })
            .then(d => {
                daemon = d
                if(daemon) {
                    return Servers.update({
                        "daemon._id":daemon._id
                    },{
                        $set:{
                            daemon:daemon
                        }
                    },{
                        multi:true
                    })
                } else {
                    res.json(404, daemon)
                }
            })
            .then(d => {
                res.json(200, daemon)
            }) 
            .catch(err => {
                res.json(400, err)
            })
}

function remove(req, res, next) {
    let daemon;
    Daemons
        .findOne({
            _id: req.params.id
        })
        .then(d => {
            daemon = d
            if(daemon) {
                return Servers.count({
                    "daemon._id":daemon._id
                })
            } else {
                res.json(404, daemon)
            }
        })
        .then(d => {
            if(!d) {
                return Daemons.deleteOne({
                    _id:daemon._id
                })
            } else {
                res.json(400, {message:"Currently in use by "+d+" servers."})
            }
        })
        .then(d => {
            res.json(200, daemon)
        })
        .catch(err => {
            res.json(400, err)
        })
}

module.exports = {
  index,
  create,
  show,
  update,
  remove
}