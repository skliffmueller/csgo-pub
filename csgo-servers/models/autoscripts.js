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
    description:{ // a way to describe what the autoscript does
      type:String,
      default:""
    },
    tags:[String], // ways to identify the auto script and search against the db
    fields:[{
      key:{ // This is the identifiable key in the script to replace $key is searched in string
        type:String,
        required: true
      },
      default:{ // This is the default value to replace key with
        type:String,
        required: true
      },
      options:[String], // List of possible options
      name:String // Human readable name for field
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

module.exports = mongoose.model('Autoscripts', s)