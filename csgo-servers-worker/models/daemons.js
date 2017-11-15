'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let s = new Schema(
  {
    name:{
        type:String
    },
    config:{
        host: {
            type:String,
            required:true
        },
        port: {
            type:Number,
            default:2375 // 2376?ssl
        },
        ca: String,
        cert: String,
        key: String,
        version: {
            type:String,
            default:"v1.25"
        }
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