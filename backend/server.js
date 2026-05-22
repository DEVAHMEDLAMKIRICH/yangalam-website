require('dotenv').config()

const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')

const authRoutes = require('./src/Routes/authRoutes')
const orderRoutes = require('./src/Routes/orderRoutes')
const settingRoutes = require('./src/Routes/settingRoutes')
const uploadRoutes = require('./src/Routes/uploadRoutes')
const { initSocket } = require('./src/Config/socket')
const { notFound, errorHandler } = require('./src/Middlewares/errorMiddleware')

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 8081
app.set('trust proxy', 1)

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()) : []),
]
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Origin non autorisee par CORS'))
  },
  credentials: true,
}

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  }),
)
app.use(cors(corsOptions))
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/settings', settingRoutes)
app.use('/api/upload', uploadRoutes)

app.use(notFound)
app.use(errorHandler)

initSocket(server, corsOptions)

const handleServerError = (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} est deja utilise. Fermez l'ancien serveur Node ou changez PORT dans .env.`,
    )
    process.exit(1)
  }

  console.error('Erreur serveur:', error.message)
  process.exit(1)
}

server.on('error', handleServerError)

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI est manquant dans .env')
    }

    await mongoose.connect(process.env.MONGO_URI)

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
