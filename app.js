const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))

const mongoose = require('mongoose')
const config = require('./config/index')
mongoose.set('useCreateIndex', true)
mongoose.connect(config.mongo.url, { useNewUrlParser: true })

const requireDir = require('require-dir')
const controllers = requireDir('./controllers')

app.route('/rooms')
  .get(controllers.room.get)
  .post(controllers.room.create)
app.route('/rooms/:number')
  .put(controllers.room.update)
  .delete(controllers.room.delete)

app.route('/bookings')
  .get(controllers.booking.get)
  .post(controllers.booking.create)
app.route('/bookings/:uid')
  .put(controllers.booking.update)
  .delete(controllers.booking.delete)

const port = process.env.PORT || 3000
const server = app.listen(port, () =>
  console.log('Node server listening on port', server.address().port)
)

module.exports = server
