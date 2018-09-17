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
  return mongoose.connect(config.mongo.url, { useNewUrlParser: true })
    .then(() => t.end())
})

test('GET rooms', t => {
  const data = require('./fixtures/rooms.json')

  const req = httpMocks.createRequest({
    method: 'GET',
    url: '/rooms'
  })
  const res = httpMocks.createResponse()

  return mongoose.connection.db.dropDatabase()
    .then(() => Room.insertMany(data))
    .then(() => room.get(req, res))
    .then(() => t.deepEqual(JSON.parse(res._getData()), data))
    .then(() => t.end())
})

test('CREATE room', t => {
  const data = require('./fixtures/rooms.json')[0]

  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/rooms',
    body: data
  })
  const res = httpMocks.createResponse()

  return mongoose.connection.db.dropDatabase()
    .then(() => room.create(req, res))
    .then(() => t.equal(res.statusCode, 200))
    .then(() => Room.findOne({}, { _id: 0, name: 1, number: 1 }).lean())
    .then(doc => t.deepEqual(doc, data))
    .then(() => t.end())
})

test('CREATE room - invalid number', t => {
  const data = { number: -1, name: 'negativeRoom' }

  const req = httpMocks.createRequest({
    method: 'POST',
    url: '/rooms',
    body: data
  })
  const res = httpMocks.createResponse()

  return mongoose.connection.db.dropDatabase()
    .then(() => room.create(req, res))
    .then(() => t.equal(res.statusCode, 500))
    .then(() => {
      const msg = JSON.parse(res._getData())
      // console.log(msg)
      t.ok(msg.isJoi)
    })
    .then(() => t.end())
})

test('CREATE room - duplicate number', t => {
  const data = require('./fixtures/rooms.json')[0]

  const req1 = httpMocks.createRequest({
    method: 'POST',
    url: '/rooms',
    body: data
  })
  const res1 = httpMocks.createResponse()

  const req2 = httpMocks.createRequest({
    method: 'POST',
    url: '/rooms',
    body: data
  })
  const res2 = httpMocks.createResponse()

  return mongoose.connection.db.dropDatabase()
    .then(() => room.create(req1, res1))
    // .then(() => console.log('res1', JSON.parse(res1._getData())))
    .then(() => t.equal(res1.statusCode, 200))
    .then(() => room.create(req2, res2))
    // .then(() => console.log('res2', JSON.parse(res2._getData())))
    .then(() => t.equal(res2.statusCode, 500))
    .then(() => Room.find({}, { _id: 0, name: 1, number: 1 }).lean())
    .then(docs => t.equal(docs.length, 1))
    .then(() => t.end())
})

test('UPDATE room', t => {
  const data = require('./fixtures/rooms.json')
  const data0 = { ...data[0] }
  data0.name = 'Another name'

  const req = httpMocks.createRequest({
    method: 'PUT',
    url: `/rooms/${data0.number}`,
    params: { number: data0.number },
    body: { name: data0.name }
  })
  const res = httpMocks.createResponse()

  return mongoose.connection.db.dropDatabase()
    .then(() => Room.insertMany(data))
    .then(() => room.update(req, res))
    // .then(() => console.log('res', res._getData()))
    .then(() => t.equal(res.statusCode, 200))
    .then(() => Room.findOne({ number: data0.number },
      { _id: 0, __v: 0, updatedAt: 0 }).lean())
    .then(doc => t.deepEqual(doc, data0))
    .then(() => t.end())
})

// TODO: test UPDATE passing number

test('DELETE room', t => {
  const data = require('./fixtures/rooms.json')[0]

  const req = httpMocks.createRequest({
    method: 'DELETE',
    url: `/rooms/${data.number}`,
    params: { number: data.number }
  })
  const res = httpMocks.createResponse()

  return mongoose.connection.db.dropDatabase()
    .then(() => Room.create(data))
    .then(() => room.delete(req, res))
    // .then(() => console.log('res', res._getData()))
    .then(() => t.equal(res.statusCode, 200))
    .then(() => Room.findOne({}, { _id: 0, __v: 0, updatedAt: 0 }).lean())
    .then(doc => t.deepEqual(doc, { ...data, isDeleted: true }))
    .then(() => t.end())
})

after('clean up', t =>
  mongoose.connection.db.dropDatabase()
    .then(() => mongoose.connection.close())
    .then(() => t.end()))
