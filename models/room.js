const mongoose = require('mongoose')
const Schema = mongoose.Schema

const roomSchema = new Schema({
  number: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  createdAt: Date,
  updatedAt: Date
})

const Room = mongoose.model('Room', roomSchema)
module.exports = Room
