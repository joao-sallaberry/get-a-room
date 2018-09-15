const mongoose = require('mongoose')
const Schema = mongoose.Schema

const m = require('moment')

const Room = require('./room')

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
  isDeleted: Boolean,
  responsible: String,
  createdAt: Date,
  updatedAt: Date
})

const Booking = mongoose.model('Booking', bookingSchema)

// check if room exists
bookingSchema.path('roomNumber').validate(value => {
  return Room.findOne({ number: value })
    .then(doc => doc)
}, 'Room number does not exist')

bookingSchema.pre('save', function (next) {
  // check if start and end at same day
  if (!m(this.startAt).utc().isSame(m(this.endAt).utc(), 'day')) {
    return next(new Error('Booking must start and end at the same day'))
  }

  // check time overlap
  const error = new Error('Room already in use at this time')
  return Booking.find({
    roomNumber: this.roomNumber,
    startAt: { $lte: this.startAt },
    endAt: { $gt: this.startAt }
  }).then(docs => {
    if (docs.length > 0) throw error
  }).then(() =>
    Booking.find({
      roomNumber: this.roomNumber,
      startAt: { $lt: this.endAt },
      endAt: { $gte: this.endAt }
    })).then(docs => {
    if (docs.length > 0) throw error
  })
    .then(() => next())
    .catch(err => next(err))
})

module.exports = Booking
