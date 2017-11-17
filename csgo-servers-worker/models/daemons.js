'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let s = new Schema(
  {
    name:{
        type:String,
        required:true,
        unique:true
    },
    config:{
        host: {
            type:String,
            required:true
        },
        port: {
            type:Number,
            default:2376 // 2376?ssl
        },
        ca: String,
        cert: String,
        key: String,
        version: {
            type:String,
            default:"v1.29"
        }
    },
    /*registry:{
        host:{
            type:String,
            required:true
        },
        port:{
            type:Number,
            default:5000
        },
        ca: String,
        cert: String,
        key: String
    },*/
    status:{
        type:String,
        enum:['ONLINE', 'VERIFYING', 'OFFLINE'],
        default:'OFFLINE'
    }
  },
  {
    id: false,
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
)

module.exports = mongoose.model('Daemons', s)