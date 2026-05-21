const express = require('express')
const multer = require('multer')
const { getUploadedImage, uploadImage } = require('../Controllers/uploadController')
const { requireAdminAuth } = require('../Middlewares/authMiddleware')

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Seules les images sont autorisées'))
      return
    }

    cb(null, true)
  },
})

router.get('/file', getUploadedImage)
router.post('/', requireAdminAuth, upload.single('image'), uploadImage)

module.exports = router
