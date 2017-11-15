'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let s = new Schema(
  {
    name:{ type:String }, // Generic displayable name for image
    imagePath:{
        // For now this will be a path to the image on the server
        // This will be expanded on when we want to scale
        type:String
    },
    imageSize:{
        type:String
    },
    type:{
        type:String,
        enum:['BASE','CONTAINER','MERGE']
    },
    versionStatus:{
        type:String,
        enum:['RECENT','OLD','DELETED','TEST']
    },
    version:{
        // For BASE type
        // use version code available from hlserver
        // github tag z.y.x format
        type:String
    },
    uniqueName:{ // unique name for the image such as csgo-srcds
        type:String
    },
    containerId:{
        // Will also have to scale with location
        type:String
    },
    imageList:[{ // Should only consist of base image versions
        _id:Schema.Types.ObjectId,
        imagePath:String,
        version:String,
        uniqueName:String
    }],
    status:{ type:String, enum:['MOUNTED','FTP','STEAMCMD','GITHUB','CONTAINER','IDLE']}
  },
  {
    id: false,
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
)

module.exports = mongoose.model('Images', s)
/*

*/