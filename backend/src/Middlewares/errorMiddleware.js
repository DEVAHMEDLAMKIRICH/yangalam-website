const notFound = (req, res) => {
  res.status(404).json({ message: 'Route introuvable' })
}

const errorHandler = (error, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    statusCode = 400
  }

  if (error.name === 'MulterError') {
    statusCode = 400
  }

  res.status(statusCode).json({
    message: error.message || 'Erreur serveur',
  })
}

module.exports = {
  notFound,
  errorHandler,
}
