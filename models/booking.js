const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bookingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  roomNumber: {
    type: Number,
    required: true
  },
  startAt: {
    type: Date,
    required: true
  },
  endAt: {
    type: Date,
    required: true
  },
  responsible: String,
  createdAt: Date,
  updatedAt: Date
})

const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking
