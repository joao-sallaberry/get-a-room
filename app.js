const express = require('express')
const app = express()

const mongoose = require('mongoose')
const config = require('./config/index')
mongoose.connect(config.mongo.url, { useNewUrlParser: true })

const port = process.env.PORT || 3000
const server = app.listen(port, () =>
  console.log('Node server listening on port', server.address().port)
)

module.exports = server
