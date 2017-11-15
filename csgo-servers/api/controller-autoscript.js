'use strict'

const restify = require('restify')
const Autoscripts = require('../models/autoscripts')
const Servers = require('../models/servers')
const Daemons = require('../models/daemons')

const nats = require('../lib/nats')

function index(req, res, next) {
    let query = {}
    if(req.body.tags) {
        query.tags = {$in:req.query.tags.split(',')}
    }
    Autoscripts
        .find(query)
        .sort({
            name:1
        })
        .then(autoscripts => res.json(200, autoscripts))
        .catch(err => res.json(400, err))
}

function create(req, res, next) {
    var autoscript = new Autoscripts({
        name: req.body.name,
        description: req.body.description,
        tags:req.body.tags,
        fields:req.body.fields,
        exec:req.body.exec
    })
    autoscript
        .save()
        .then(autoscript => res.json(201, autoscript))
        .catch(err => res.json(400, err))
}

function show(req, res, next) {
    Autoscripts
        .findOne({
            _id:req.params.id
        })
        .lean()
        .then(autoscript => res.json(200, autoscript))
        .catch(err => res.json(400, err))
}

function update(req, res, next) {
    let set = {}
    if(req.body.name) {
        set.name = req.body.name
    }
    if(req.body.description) {
        set.description = req.body.description
    }
    if(req.body.tags) {
        set.tags = req.body.tags
    }
    if(req.body.fields) {
        set.fields = req.body.fields
    }
    if(req.body.exec) {
        set.exec = req.body.exec
    }
    Autoscripts
        .findOneAndUpdate({
            _id:req.params.id
        },{
            $set:set
        },{
            new:true
        })
        .then(autoscript => res.json(200, autoscript))
        .catch(err => res.json(400, err))
}

function remove(req, res, next) {
    Autoscripts
        .deleteOne({
            _id:req.params._id
        })
        .then(d => res.json(200, d))
        .catch(err => res.json(400, err))
}

module.exports = {
  index,
  create,
  show,
  update,
  remove
}