const ADMIN_COOKIE_NAME = 'yanglam_admin_token'
const ADMIN_TOKEN_EXPIRES_IN = '8h'
const ADMIN_COOKIE_MAX_AGE = 8 * 60 * 60 * 1000

const isHttpsRequest = (req) => {
  return req?.secure || req?.headers?.['x-forwarded-proto'] === 'https'
}

const shouldUseSecureCookie = (req) => {
  if (process.env.ADMIN_COOKIE_SECURE === 'true') {
    return true
  }

  if (process.env.ADMIN_COOKIE_SECURE === 'false') {
    return false
  }

  return isHttpsRequest(req)
}

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

const getAdminCookieOptions = (req) => ({
  httpOnly: true,
  secure: shouldUseSecureCookie(req),
  sameSite: process.env.ADMIN_COOKIE_SAME_SITE || 'lax',
  maxAge: ADMIN_COOKIE_MAX_AGE,
  path: '/',
})

const getClearAdminCookieOptions = (req) => ({
  ...getAdminCookieOptions(req),
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
