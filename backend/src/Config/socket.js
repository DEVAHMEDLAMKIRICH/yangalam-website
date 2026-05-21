let ioInstance = null

const ORDER_CREATED_EVENT = 'orders:new'

const { ADMIN_COOKIE_NAME } = require('./adminAuth')
const { getAdminFromToken } = require('../Middlewares/authMiddleware')

const parseCookieHeader = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((cookies, cookiePart) => {
    const [rawName, ...rawValue] = cookiePart.trim().split('=')

    if (!rawName) {
      return cookies
    }

    cookies[rawName] = decodeURIComponent(rawValue.join('='))
    return cookies
  }, {})
}

const initSocket = (server, corsOptions) => {
  const { Server } = require('socket.io')

  ioInstance = new Server(server, {
    cors: corsOptions,
  })

  ioInstance.use(async (socket, next) => {
    try {
      const cookies = parseCookieHeader(socket.handshake.headers.cookie || '')
      const token = cookies[ADMIN_COOKIE_NAME]

      if (!token) {
        return next(new Error('Connexion admin requise'))
      }

      const admin = await getAdminFromToken(token)

      if (!admin) {
        return next(new Error('Acces refuse'))
      }

      socket.admin = {
        id: admin._id.toString(),
        username: admin.username,
        role: admin.role,
      }

      return next()
    } catch {
      return next(new Error('Session admin invalide'))
    }
  })

  ioInstance.on('connection', (socket) => {
    socket.emit('socket:ready', { connected: true })
  })

  return ioInstance
}

const getSocket = () => ioInstance

const emitOrderCreated = (order) => {
  if (!ioInstance || !order) {
    return
  }

  ioInstance.emit(ORDER_CREATED_EVENT, order)
}

module.exports = {
  ORDER_CREATED_EVENT,
  emitOrderCreated,
  getSocket,
  initSocket,
}
