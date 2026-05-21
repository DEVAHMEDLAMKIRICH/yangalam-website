const rateLimit = require('express-rate-limit')

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'محاولات الدخول كثيرة. عاود حاول من بعد 15 دقيقة.',
  },
})

module.exports = {
  adminLoginLimiter,
}
