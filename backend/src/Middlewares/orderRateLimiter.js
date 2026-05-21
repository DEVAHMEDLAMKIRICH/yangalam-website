const rateLimit = require('express-rate-limit')

const orderCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'راك درتي بزاف ديال الطلبات. عاود حاول من بعد 15 دقيقة.',
  },
})

module.exports = {
  orderCreationLimiter,
}
