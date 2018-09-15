const Booking = require('../models/booking')
const Joi = require('joi')
const m = require('moment')

module.exports = {
  get: (req, res) => {
    const schema = Joi.object().keys({
      roomNumber: Joi.number().integer().positive(),
      date: Joi.date()
    })

    return Joi.validate(req.body, schema)
      .then(body => {
        if (body.date) {
          // ignore time from 'date'
          body.startAt = { $gte: m(body.date).utc().startOf('day') }
          body.endAt = { $lte: m(body.date).utc().endOf('day') }
          delete body.date
        }

        return Booking.find({
          ...body,
          isDeleted: { $ne: true }
        }).lean()
      })
      .then(booking => res.json(booking))
      .catch(err => res.status(500).json(err))
  },

  create: (req, res) => {
    const now = new Date()
    const schema = Joi.object().keys({
      title: Joi.string().required(),
      roomNumber: Joi.number().integer().positive().required(),
      startAt: Joi.date().min(now).required(),
      endAt: Joi.date().greater(Joi.ref('startAt')).required()
    })

    return Joi.validate(req.body, schema)
      .then(body =>
        Booking.create({
          ...body,
          createdAt: now,
          updatedAt: now
        }))
      .then(booking => res.json(booking))
      .catch(err => {
        console.log('blablab')
        res.status(500).json(err)
      })
  },

  update: (req, res) => {
    const now = new Date()
    const schema = Joi.object().keys({
      title: Joi.string(),
      roomNumber: Joi.number().integer().positive(),
      startAt: Joi.date().min(now),
      endAt: Joi.date().greater(Joi.ref('startAt')) // FIXME: error if no 'startAt'
    })

    return Joi.validate(req.body, schema)
      .then(body =>
        Booking.findOneAndUpdate(
          {
            _id: req.params.uid,
            isDeleted: { $ne: true }
          },
          {
            ...body,
            updatedAt: now
          }, { new: true }))
      .then(booking => res.json(booking))
      .catch(err => res.status(500).json(err))
  },

  delete: (req, res) =>
    Booking.findOneAndUpdate(
      {
        _id: req.params.uid,
        isDeleted: { $ne: true }
      },
      {
        isDeleted: true,
        updatedAt: new Date()
      }, { new: true })
      .then(booking => res.json(booking))
      .catch(err => res.status(500).json(err))
}
