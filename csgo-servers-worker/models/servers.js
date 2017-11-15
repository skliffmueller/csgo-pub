'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let s = new Schema(
  {
    name:{
      type:String,
      required:true
    },
    tags:[String],
    status:{
      type:String,
      enum:['ONLINE','OFFLINE','IDLE','ERROR','STARTING','GENERATING'],
      default:"OFFLINE"
    },
    lastStatus:{
      code:Number,
      body:String
    },
    srcds:{
      rconPassword:{
        type:String,
        required:true
      },
      ip:{
        type:String,
        required:true
      },
      port:{
        type:Number,
        required:true
      },
      startArgv:[String]
    },
    daemon:{
      _id:Schema.Types.ObjectId,
      name:{
        type:String
      },
      config:{
          host: {
              type:String
          },
          port: {
              type:Number
          },
          ca: String,
          cert: String,
          key: String,
          version: {
              type:String
          }
      }
    },
    container:{
      Id:{type:String},
      Names:[{type:String}],
      Image:{type:String},
      ImageId:{type:String},
      // Mounts may have what we need for node linking
      // If not Network settings may have insight
    },
    image:{
      _id:Schema.Types.ObjectId,
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
      status:{ type:String, enum:['MOUNTED','FTP','STEAMCMD','GITHUB','CONTAINER','IDLE']}
    },  
    redis:{
      name:{
        type:String,
        unique:true
      },
      host:String,
      port:Number,
      auth:String
    },
    rconStatus: Schema.Types.Mixed
  },
  {
    id: false,
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
)

module.exports = mongoose.model('Servers', s)
/*
{
    name:"Test Server",
    tags:["test"],
    status:"OFF",
    lastStatus:{
      code:201,
      body:"Created"
    },
    srcds:{
      rconPassword:"rewdsfrwefsdf",
      ip:"174.138.62.128",
      port:27015,
      startArgv:[
        '-game',
        'csgo',
        '-console',
        '-usercon',
        '+game_type',
        '0',
        '+game_mode',
        '1',
        '+map',
        'de_dust2',
        '+rcon_password',
        'rewdsfrwefsdf',
        '+sv_setsteamaccount',
        'A902BE6675F829F3899798DBE0DCC808',
        '+ip',
        '174.138.62.128',
        '+port',
        '27015'
      ]
    },
    redis:{
      name:"Something",
      host:"104.236.235.20",
      port:6379,
      auth:"acedUwjms0923NFS9038LSkkw"
    },
    rconStatus: {}
}


*/