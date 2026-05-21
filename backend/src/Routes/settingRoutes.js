const express = require('express')
const { getSettings, updateSettings } = require('../Controllers/settingController')
const { requireAdminAuth } = require('../Middlewares/authMiddleware')

const router = express.Router()

router.get('/', getSettings)
router.put('/', requireAdminAuth, updateSettings)

module.exports = router
