const mongoose = require('mongoose')
const Schema = mongoose.Schema

const roomSchema = new Schema({
  number: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
})

const Room = mongoose.model('Room', roomSchema)

roomSchema.path('number').validate(value => {
  return Room.findOne({ number: value })
    .then(doc => !doc)
}, 'Room number already exists');


module.exports = Room
