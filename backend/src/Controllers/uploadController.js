const crypto = require('crypto')
const { GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3')
const sharp = require('sharp')
const r2Client = require('../Config/r2')

const requiredR2Env = [
  'R2_ENDPOINT',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
]
const WEBP_QUALITY = 82

const createPublicUrl = (key, req) => {
  const publicUrl = process.env.R2_PUBLIC_URL

  if (!publicUrl) {
    const apiPublicUrl = process.env.API_PUBLIC_URL || `${req.protocol}://${req.get('host')}`
    return `${apiPublicUrl.replace(/\/$/, '')}/api/upload/file?key=${encodeURIComponent(key)}`
  }

  return `${publicUrl.replace(/\/$/, '')}/${key}`
}

const sanitizeUploadFolder = (folder) => {
  const safeFolder = String(folder || 'uploads')
    .replace(/\\/g, '/')
    .split('/')
    .map((part) => part.trim().replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-'))
    .filter(Boolean)
    .join('/')

  return safeFolder || 'uploads'
}

const convertImageToWebp = async (fileBuffer) => {
  return sharp(fileBuffer)
    .rotate()
    .webp({
      quality: WEBP_QUALITY,
      effort: 5,
    })
    .toBuffer()
}

const uploadImage = async (req, res, next) => {
  try {
    const missingEnv = requiredR2Env.filter((envName) => !process.env[envName])

    if (missingEnv.length) {
      return res.status(500).json({
        message: 'Configuration Cloudflare R2 incomplète',
        missing: missingEnv,
      })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image envoyée' })
    }

    const folder = sanitizeUploadFolder(req.body.folder)
    const key = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.webp`
    const webpBuffer = await convertImageToWebp(req.file.buffer)

    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: webpBuffer,
        ContentType: 'image/webp',
      }),
    )

    return res.status(201).json({
      key,
      url: createPublicUrl(key, req),
    })
  } catch (error) {
    return next(error)
  }
}

const getUploadedImage = async (req, res, next) => {
  try {
    const { key } = req.query

    if (!key) {
      return res.status(400).json({ message: 'Image key is required' })
    }

    const result = await r2Client.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      }),
    )

    if (result.ContentType) {
      res.setHeader('Content-Type', result.ContentType)
    }

    res.setHeader('Cache-Control', 'no-store')

    return result.Body.pipe(res)
  } catch (error) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ message: 'Image introuvable dans Cloudflare R2' })
    }

    return next(error)
  }
}

module.exports = {
  getUploadedImage,
  uploadImage,
}
