const express = require('express')
const { getCurrentAdmin, loginAdmin, logoutAdmin } = require('../Controllers/authController')
const { requireAdminAuth } = require('../Middlewares/authMiddleware')
const { adminLoginLimiter } = require('../Middlewares/authRateLimiter')

const router = express.Router()

router.post('/login', adminLoginLimiter, loginAdmin)
router.get('/me', requireAdminAuth, getCurrentAdmin)
router.post('/logout', logoutAdmin)

module.exports = router
