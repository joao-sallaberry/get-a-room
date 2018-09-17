const Room = require('../models/room')
const Joi = require('joi')

module.exports = {
  get: (req, res) => {
    return Room.find({ isDeleted: { $ne: true } },
      { _id: 0, name: 1, number: 1 }).lean()
      .then(rooms => res.json(rooms))
      .catch(err => res.status(500).json(err))
  },

  create: (req, res) => {
    const schema = Joi.object().keys({
      number: Joi.number().integer().positive().required(),
      name: Joi.string().required()
    })

    return Joi.validate(req.body, schema)
      .then(body => {
        const now = new Date()
        return Room.create({
          ...body,
          createdAt: now,
          updatedAt: now
        })
      })
      .then(room => res.json(room))
      .catch(err => res.status(500).json(err))
  },

  update: (req, res) => {
    const schema = Joi.object().keys({
      name: Joi.string().required()
    })

    return Joi.validate(req.body, schema)
      .then(body =>
        Room.findOneAndUpdate(
          {
            number: req.params.number,
            isDeleted: { $ne: true }
          },
          {
            name: body.name,
            updatedAt: new Date()
          }, { new: true })
      )
      .then(room => res.json(room))
      .catch(err => res.status(500).json(err))
  },

  delete: (req, res) => {
    return Room.findOneAndUpdate(
      {
        number: req.params.number,
        isDeleted: { $ne: true }
      },
      {
        isDeleted: true,
        updatedAt: new Date()
      }, { new: true })
      .then(room => res.json(room))
      .catch(err => res.status(500).json(err))
  }
}
