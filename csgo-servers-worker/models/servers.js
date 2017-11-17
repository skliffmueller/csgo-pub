'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let s = new Schema(
  {
    tags:[String],
    deploymentConfig:{
      name:String,
      HostName:String,
      Domainname:String,
      User:String,
      AttachStdin:{
        type:Boolean,
        default:false
      },
      AttachStdout:{
        type:Boolean,
        default:false
      },
      AttachStderr:{
        type:Boolean,
        default:false
      },
      ExposePorts:Schema.Types.Mixed,
      Tty:Boolean,
      OpenStdin:Boolean,
      StdinOnce:Boolean,
      Env:[String], // Something=Another
      Cmd:{
        type:String,
        required:true
      },
      Image:{ // Image name for container csgo-srcds
        type:String,
        required:true
      },
      Volumes:Schema.Types.Mixed,
      WorkingDir:{
        type:String,
        required:true
      },
      EntryPoint:String,
      NetworkDisabled:Boolean,
      MacAddress:String,
      OnBuild:[String],
      Labels:Schema.Types.Mixed,
      StopSignal:{
        type:String,
        default:"SIGTERM"
      },
      StopTimeout:{
        type:Number,
        default:10
      },
      HostConfig:Schema.Types.Mixed,
      NetworkingConfig:Schema.Types.Mixed
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
      }/*,
      registry:{
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
      }*/
    },
    container:{
      Id:{
        type:String,
        default:""
      },
      Name:{
        type:String,
        default:""
      },
      State:{
          Status: {
            type:String,
            enum:["created", "running", "paused", "restarting", "removing", "exited", "dead"],
            default:"created"
          },
          Running: {
            type:Boolean,
            default:false
          },
          Paused: {
            type:Boolean,
            default:false
          },
          Restarting: {
            type:Boolean,
            default:false
          },
          OOMKilled: {
            type:Boolean,
            default:false
          },
          Dead: {
            type:Boolean,
            default:false
          },
          Pid: {
            type:Number,
            default: 0
          },
          ExitCode: {
            type:Number,
            default:0
          },
          Error: {
            type:String,
            default:""
          },
          StartedAt: {
            type:Date,
            default:new Date(0)
          },
          FinishedAt: {
            type:Date,
            default:new Date(0)
          }
      }
      /*
          "State": {
              "Status": "running",
              "Running": true,
              "Paused": false,
              "Restarting": false,
              "OOMKilled": false,
              "Dead": false,
              "Pid": 18577,
              "ExitCode": 0,
              "Error": "",
              "StartedAt": "2017-08-24T00:06:15.408455743Z",
              "FinishedAt": "2017-08-24T00:05:23.877797271Z"
          },
      */
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
          enum:['BASE','CONTAINER','MERGE'],
          default:'CONTAINER'
      },
      versionStatus:{
          type:String,
          enum:['RECENT','OLD','DELETED','TEST'],
          default:'RECENT'
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
      status:{
        type:String,
        enum:['MOUNTED','FTP','STEAMCMD','GITHUB','CONTAINER','IDLE'],
        default:'MOUNTED'
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