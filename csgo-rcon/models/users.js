'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let userSchema = new Schema(
  {
    email: {type: String, unique: true, required: true},
    password: { type: String, required: true },
    
    accessTags:[String],

    createdAt: { type: Date }
  },
  {
    id: false,
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
)

userSchema.index({ email: 1 })

userSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase()
  }

  this.createdAt = new Date();

  next()
})

module.exports = mongoose.model('Users', userSchema)