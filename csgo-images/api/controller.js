'use strict'

const restify = require('restify')
const Images = require('../models/images')
const nats = require('../lib/nats')

function index(req, res, next) {
    let query = {}
    if(!req.query.showDeleted) {
        query['versionStatus'] = {$ne:'DELETED'}
    }
    Images.find(query)
            .sort({
                name:-1,
                version:-1
            })
            .exec()
            .then((images) => {
                res.json(200, images)
            })
}

function create(req, res, next) {

    var image = new Images({
        name:req.body.name,
        type:req.body.type,
        imageSize:req.body.imageSize,
        versionStatus:req.body.versionStatus,
        version:req.body.version,
        uniqueName:req.body.uniqueName,
        containerId:"",
        imageList:req.body.imageList,
        status:'IDLE'
    })
    image.imagePath = `/var/images/${image._id}.qcow2`

    image.save()
        .then((image) => {
            nats.publish('image::create', image._id.toString())
            res.json(201, image)
        })
}

function show(req, res, next) {
    Images.findOne({
                _id:req.params.id
            })
            .lean()
            .exec()
            .then((image) => {
                res.json(200, image)
            })
}


function details(req, res, next) {
    let body = {}
    if(req.body.type) {
        body.type = req.body.type
    }
    if(req.body.version) {
        body.version = req.body.version
    }
    if(req.body.name) {
        body.name = req.body.name
    }
    if(req.body.versionStatus) {
        body.versionStatus = req.body.versionStatus
    }
    Images.findOneAndUpdate({
            _id:req.params.id
        },{
            $set:body
        },{
            new: true
        })
        .lean()
        .exec()
        .then((image) => {
            res.json(200, image)
        })
}

function modify(req, res, next) {
    Images.findOne({
            _id:req.params.id
        })
        .lean()
        .exec()
        .then((image) => {
            if(!image) {
                return Promise.reject({code:404,message:"Image not found"});
            }
            // Trigger github pull, ftp server attachment, steamcmd update, basic mount
            let body = JSON.stringify({
                _id:image._id,
                status:req.body.status, // MOUNTED, FTP, STEAMCMD, GITHUB
                options:req.body.options
            })
            nats.publish('image::modify', body)
            res.json(200, image)
        })
        .catch((err) => {
            res.json(err.code || 400, err)
        })
}

function done(req, res, next) {
    Images.findOne({
        _id:req.params.id
    })
    .lean()
    .exec()
    .then((image) => {
        if(image.status!=='FTP' && image.status!=='MOUNTED') {
            res.json(400, {message:"Cannot umount image"})
            return;
        }
        // Trigger github pull, ftp server attachment, steamcmd update, basic mount
        nats.publish('image::done', image._id.toString())
        res.json(200, image)
    })
}


module.exports = {
  index,
  create,
  show,
  details,
  modify,
  done
}