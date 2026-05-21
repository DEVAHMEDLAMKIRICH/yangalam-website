const express = require('express')
const {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrder,
  updateOrderStatut,
} = require('../Controllers/orderController')
const { requireAdminAuth } = require('../Middlewares/authMiddleware')
const { orderCreationLimiter } = require('../Middlewares/orderRateLimiter')

const router = express.Router()

router.post('/', orderCreationLimiter, createOrder)
router.use(requireAdminAuth)
router.get('/', getOrders)
router.get('/:id', getOrderById)
router.put('/:id/statut', updateOrderStatut)
router.put('/:id', updateOrder)
router.delete('/:id', deleteOrder)

module.exports = router
