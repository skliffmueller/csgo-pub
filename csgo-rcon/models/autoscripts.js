'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let autoSchema = new Schema(
  {
    name:{
      type:String,
      required:true
    },
    description:{
      type:String,
      default:""
    },
    tags:[String],
    fields:[{
      key:{
        type:String,
        required: true
      },
      default:{
        type:String,
        required: true
      },
      options:[String],
      name:String
    }],
    exec:[String]
  },
  {
    id: false,
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
)

module.exports = mongoose.model('Autoscripts', autoSchema)