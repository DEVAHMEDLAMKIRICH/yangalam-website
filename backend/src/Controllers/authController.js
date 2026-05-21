const jwt = require('jsonwebtoken')
const { z } = require('zod')
const {
  ADMIN_COOKIE_NAME,
  ADMIN_TOKEN_EXPIRES_IN,
  getAdminCookieOptions,
  getClearAdminCookieOptions,
  getJwtSecret,
} = require('../Config/adminAuth')
const Admin = require('../Models/Admin')

const loginSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(200),
})

const getSafeAdmin = (admin) => ({
  id: admin._id,
  username: admin.username,
  role: admin.role,
})

const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body)
    const normalizedUsername = username.toLowerCase()
    const admin = await Admin.findOne({
      username: normalizedUsername,
      isActive: true,
    }).select('+passwordHash')
    const passwordMatches = admin && (await admin.comparePassword(password))

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Identifiants admin incorrects' })
    }

    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        username: admin.username,
        role: admin.role,
      },
      getJwtSecret(),
      {
        expiresIn: ADMIN_TOKEN_EXPIRES_IN,
        subject: admin._id.toString(),
      },
    )

    res.cookie(ADMIN_COOKIE_NAME, token, getAdminCookieOptions())

    return res.status(200).json({
      authenticated: true,
      admin: getSafeAdmin(admin),
    })
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Donnees de connexion invalides' })
    }

    return next(error)
  }
}

const getCurrentAdmin = (req, res) => {
  return res.status(200).json({
    authenticated: true,
    admin: getSafeAdmin(req.admin),
  })
}

const logoutAdmin = (req, res) => {
  res.clearCookie(ADMIN_COOKIE_NAME, getClearAdminCookieOptions())

  return res.status(200).json({
    authenticated: false,
    message: 'Deconnexion reussie',
  })
}

module.exports = {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
}
