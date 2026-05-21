const ADMIN_COOKIE_NAME = 'yanglam_admin_token'
const ADMIN_TOKEN_EXPIRES_IN = '8h'
const ADMIN_COOKIE_MAX_AGE = 8 * 60 * 60 * 1000

const getJwtSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET

  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET est manquant dans .env')
  }

  if (secret.length < 32) {
    throw new Error('ADMIN_JWT_SECRET doit contenir au moins 32 caracteres')
  }

  return secret
}

const getAdminCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.ADMIN_COOKIE_SAME_SITE || 'lax',
  maxAge: ADMIN_COOKIE_MAX_AGE,
  path: '/',
})

const getClearAdminCookieOptions = () => ({
  ...getAdminCookieOptions(),
  maxAge: 0,
})

module.exports = {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  ADMIN_TOKEN_EXPIRES_IN,
  getAdminCookieOptions,
  getClearAdminCookieOptions,
  getJwtSecret,
}
