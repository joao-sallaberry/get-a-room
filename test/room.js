const test = require('tape')
const httpMocks = require('node-mocks-http')

const Room = require('../models/room')
const room = require('../controllers/room')

const mongoose = require('mongoose')
const config = require('../config/index')

const before = test
const after = test

before('set up', t => {
  mongoose.set('useCreateIndex', true)
  mongoose.connect(config.mongo.url, { useNewUrlParser: true })
    .then(() => t.end())
})

test('GET rooms', t => {
  const data = [
    { number: 7, name: 'Tokyo' },
    { number: 10, name: 'Cape Town' }
  ]

  const req = httpMocks.createRequest({
    method: 'GET',
    url: '/rooms'
  })
  const res = httpMocks.createResponse()

  mongoose.connection.db.dropDatabase()
    .then(() => Room.insertMany(data))
    .then(() => room.get(req, res))
    .then(() => t.deepEqual(JSON.parse(res._getData()), data))
    .then(() => t.end())
})

test('CREATE room', t => {
  const data = {
    number: 11,
    name: 'New York'
  }
  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/rooms',
    body: data
  })
  const res = httpMocks.createResponse()

  mongoose.connection.db.dropDatabase()
    .then(() => room.create(req, res))
    .then(() => t.equal(200, res.statusCode))
    .then(() => Room.findOne({}, { _id: 0, name: 1, number: 1}).lean())
    .then(doc => t.deepEqual(doc, data))
    .then(() => t.end())
})

after('clean up', t => {
  mongoose.connection.db.dropDatabase()
    .then(() => mongoose.connection.close())
    .then(() => t.end())
})
