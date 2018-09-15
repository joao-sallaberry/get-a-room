const test = require('tape')
const httpMocks = require('node-mocks-http')
const m = require('moment')

const Room = require('../models/room')
const Booking = require('../models/booking')
const booking = require('../controllers/booking')

const mongoose = require('mongoose')
const config = require('../config/index')

const before = test
const after = test

before('set up', t => {
  mongoose.set('useCreateIndex', true)
  return mongoose.connect(config.mongo.url, { useNewUrlParser: true })
    .then(() => t.end())
})

test('GET all bookings', t => {
  const roomData = require('./fixtures/rooms.json')
  const bookingData = require('./fixtures/bookings.json')
  bookingData.roomNumber = roomData.number

  const req = httpMocks.createRequest({
    method: 'GET',
    url: '/bookings'
  })
  const res = httpMocks.createResponse()

  return mongoose.connection.db.dropDatabase()
    .then(() => Room.insertMany(roomData))
    .then(() => Booking.insertMany(bookingData))
    .then(() => booking.get(req, res))
    .then(() => t.equal(JSON.parse(res._getData()).length, bookingData.length))
    .then(() => t.end())
})

test('GET some bookings', t => {
  const roomData = require('./fixtures/rooms.json')
  const bookingData = require('./fixtures/bookings.json')

  const roomNumber = bookingData[0].roomNumber
  const date = m(bookingData[0].startAt).format('YYYY-MM-DD')

  const req = httpMocks.createRequest({
    method: 'GET',
    url: '/bookings',
    body: { roomNumber, date }
  })
  const res = httpMocks.createResponse()

  return mongoose.connection.db.dropDatabase()
    .then(() => Room.insertMany(roomData))
    .then(() => Booking.insertMany(bookingData))
    .then(() => booking.get(req, res))
    .then(() => t.equal(JSON.parse(res._getData()).length, 1))
    .then(() => t.equal(JSON.parse(res._getData())[0].title, bookingData[0].title))
    .then(() => t.end())
})

test('CREATE booking', t => {
  const roomData = require('./fixtures/rooms.json')[0]
  const bookingData = { ...require('./fixtures/bookings.json')[0] }
  bookingData.roomNumber = roomData.number

  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/bookings',
    body: bookingData
  })
  const res = httpMocks.createResponse()

  const expected = { ...bookingData }
  expected.startAt = new Date(expected.startAt)
  expected.endAt = new Date(expected.endAt)

  return mongoose.connection.db.dropDatabase()
    .then(() => Room.create(roomData))
    .then(() => booking.create(req, res))
    // .then(() => console.log('res', JSON.parse(res._getData())))
    .then(() => t.equal(res.statusCode, 200))
    .then(() => Booking.findOne({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).lean())
    .then(doc => t.deepEqual(doc, expected))
    .then(() => t.end())
})

test('CREATE overnight booking', t => {
  const roomData = require('./fixtures/rooms.json')[0]
  const bookingData = { ...require('./fixtures/bookings.json')[0] }
  bookingData.roomNumber = roomData.number

  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/bookings',
    body: bookingData
  })
  const res = httpMocks.createResponse()

  const expected = { ...bookingData }
  expected.startAt = new Date(expected.startAt)
  expected.endAt = new Date(expected.endAt)

  return mongoose.connection.db.dropDatabase()
    .then(() => Room.create(roomData))
    .then(() => booking.create(req, res))
    // .then(() => console.log('res', JSON.parse(res._getData())))
    .then(() => t.equal(res.statusCode, 200))
    .then(() => Booking.findOne({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).lean())
    .then(doc => t.deepEqual(doc, expected))
    .then(() => t.end())
})

test('CREATE overlapping booking', t => {
  const roomData = require('./fixtures/rooms.json')[0]
  const bookingData = { ...require('./fixtures/bookings.json')[0] }
  bookingData.roomNumber = roomData.number

  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/bookings',
    body: bookingData
  })
  const res = httpMocks.createResponse()

  const expected = { ...bookingData }
  expected.startAt = new Date(expected.startAt)
  expected.endAt = new Date(expected.endAt)

  return mongoose.connection.db.dropDatabase()
    .then(() => Room.create(roomData))
    .then(() => Booking.create(bookingData))
    .then(() => booking.create(req, res))
    .then(() => console.log('res', JSON.parse(res._getData())))
    .then(() => t.equal(res.statusCode, 500))
    .then(() => t.end())
})

test('UPDATE booking', t => {
  const roomData = require('./fixtures/rooms.json')[0]
  const bookingData = { ...require('./fixtures/bookings.json')[0] }
  bookingData.roomNumber = roomData.number

  const newTitle = 'How to cut a nice sushi'

  const req = httpMocks.createRequest({
    method: 'PUT',
    url: '/bookings/fakeid',
    body: { ...bookingData, title: newTitle }
  })
  const res = httpMocks.createResponse()

  const expected = { ...bookingData }
  expected.startAt = new Date(expected.startAt)
  expected.endAt = new Date(expected.endAt)
  expected.title = newTitle

  return mongoose.connection.db.dropDatabase()
    .then(() => Room.create(roomData))
    .then(() => Booking.create(bookingData))
    .then(doc => {
      req.params.uid = doc._id
      return booking.update(req, res)
    })
    // .then(() => console.log('res', JSON.parse(res._getData())))
    .then(() => t.equal(res.statusCode, 200))
    .then(() => Booking.findOne({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).lean())
    .then(doc => t.deepEqual(doc, expected))
    .then(() => t.end())
})

test('DELETE booking', t => {
  const roomData = require('./fixtures/rooms.json')[0]
  const bookingData = { ...require('./fixtures/bookings.json')[0] }
  bookingData.roomNumber = roomData.number

  const req = httpMocks.createRequest({
    method: 'DELETE',
    url: `/bookings/fakeid`
  })
  const res = httpMocks.createResponse()

  const expected = { ...bookingData }
  expected.startAt = new Date(expected.startAt)
  expected.endAt = new Date(expected.endAt)
  expected.isDeleted = true

  return mongoose.connection.db.dropDatabase()
    .then(() => Room.create(roomData))
    .then(() => Booking.create(bookingData))
    .then(doc => {
      req.params.uid = doc._id
      return booking.delete(req, res)
    })
    // .then(() => console.log('res', res._getData()))
    .then(() => t.equal(res.statusCode, 200))
    .then(() => Booking.findOne({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).lean())
    .then(doc => t.deepEqual(doc, expected))
    .then(() => t.end())
})

after('clean up', t =>
  mongoose.connection.db.dropDatabase()
    .then(() => mongoose.connection.close())
    .then(() => t.end()))
