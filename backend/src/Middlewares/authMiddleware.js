const jwt = require('jsonwebtoken')
const { ADMIN_COOKIE_NAME, getJwtSecret } = require('../Config/adminAuth')
const Admin = require('../Models/Admin')

const verifyAdminToken = (token) => {
  return jwt.verify(token, getJwtSecret())
}

const getAdminFromToken = async (token) => {
  const payload = verifyAdminToken(token)

  if (payload?.role !== 'admin' || !payload?.adminId) {
    return null
  }

  return Admin.findOne({
    _id: payload.adminId,
    isActive: true,
  }).select('_id username role isActive')
}

const requireAdminAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[ADMIN_COOKIE_NAME]

    if (!token) {
      return res.status(401).json({ message: 'Connexion admin requise' })
    }

    const admin = await getAdminFromToken(token)

    if (!admin) {
      return res.status(403).json({ message: 'Acces refuse' })
    }

    req.admin = admin

    return next()
  } catch {
    return res.status(401).json({ message: 'Session expiree. Reconnectez-vous.' })
  }
}

module.exports = {
  getAdminFromToken,
  requireAdminAuth,
  verifyAdminToken,
}
