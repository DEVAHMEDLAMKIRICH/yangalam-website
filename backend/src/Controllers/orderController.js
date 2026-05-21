const Order = require('../Models/Order')
const { emitOrderCreated } = require('../Config/socket')

const { STATUT_VALUES } = Order

const createOrder = async (req, res, next) => {
  try {
    const { nom, telephone, ville, adresse, codePromo } = req.body

    const order = await Order.create({
      nom,
      telephone,
      ville,
      adresse,
      codePromo,
    })

    emitOrderCreated(order.toObject())

    return res.status(201).json(order)
  } catch (error) {
    return next(error)
  }
}

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })

    return res.status(200).json(orders)
  } catch (error) {
    return next(error)
  }
}

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' })
    }

    return res.status(200).json(order)
  } catch (error) {
    return next(error)
  }
}

const buildOrderUpdate = (body) => {
  const allowedFields = ['nom', 'telephone', 'ville', 'adresse', 'codePromo', 'statut']
  const update = {}

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      update[field] = typeof body[field] === 'string' ? body[field].trim() : body[field]
    }
  })

  return update
}

const updateOrder = async (req, res, next) => {
  try {
    const update = buildOrderUpdate(req.body)

    if (update.statut !== undefined && !STATUT_VALUES.includes(update.statut)) {
      return res.status(400).json({
        message: 'Statut invalide',
        allowedValues: STATUT_VALUES,
      })
    }

    if (!Object.keys(update).length) {
      return res.status(400).json({ message: 'Aucune donnee a modifier' })
    }

    const order = await Order.findByIdAndUpdate(req.params.id, update, {
      returnDocument: 'after',
      runValidators: true,
    })

    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' })
    }

    return res.status(200).json(order)
  } catch (error) {
    return next(error)
  }
}

const updateOrderStatut = async (req, res, next) => {
  try {
    const { statut } = req.body

    if (!STATUT_VALUES.includes(statut)) {
      return res.status(400).json({
        message: 'Statut invalide',
        allowedValues: STATUT_VALUES,
      })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { statut },
      {
        returnDocument: 'after',
        runValidators: true,
      },
    )

    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' })
    }

    return res.status(200).json(order)
  } catch (error) {
    return next(error)
  }
}

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' })
    }

    return res.status(200).json({
      message: 'Commande supprimee avec succes',
      deletedOrderId: order._id,
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrder,
  updateOrderStatut,
}
