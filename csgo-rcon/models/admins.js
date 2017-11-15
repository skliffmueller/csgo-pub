'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let adminSchema = new Schema(
  {
    userId:{type:Schema.Types.ObjectId, required: true, unique: true},

    createdAt: { type: Date }
  },
  {
    id: false,
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
)

module.exports = mongoose.model('Admins', adminSchema)