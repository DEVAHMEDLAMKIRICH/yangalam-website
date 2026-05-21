const { DeleteObjectCommand } = require('@aws-sdk/client-s3')
const Setting = require('../Models/Setting')
const r2Client = require('../Config/r2')

const SETTINGS_KEY = 'homepage'

const getOrCreateSettings = () => {
  return Setting.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $setOnInsert: { key: SETTINGS_KEY } },
    {
      returnDocument: 'after',
      upsert: true,
      setDefaultsOnInsert: true,
    },
  )
}

const buildSettingsUpdate = (body) => {
  const update = {}

  if (body.hero) {
    if (body.hero.badgeText !== undefined) update['hero.badgeText'] = body.hero.badgeText
    if (body.hero.title !== undefined) update['hero.title'] = body.hero.title
    if (body.hero.description !== undefined) update['hero.description'] = body.hero.description
    if (body.hero.image !== undefined) update['hero.image'] = body.hero.image
  }

  if (body.bestSeller) {
    if (body.bestSeller.badgeText !== undefined) {
      update['bestSeller.badgeText'] = body.bestSeller.badgeText
    }
    if (body.bestSeller.name !== undefined) update['bestSeller.name'] = body.bestSeller.name
    if (body.bestSeller.price !== undefined) update['bestSeller.price'] = body.bestSeller.price
    if (body.bestSeller.description !== undefined) {
      update['bestSeller.description'] = body.bestSeller.description
    }
    if (body.bestSeller.image !== undefined) update['bestSeller.image'] = body.bestSeller.image
    if (body.bestSeller.features !== undefined) {
      update['bestSeller.features'] = body.bestSeller.features
    }
  }

  if (body.beforeAfter) {
    if (body.beforeAfter.title !== undefined) update['beforeAfter.title'] = body.beforeAfter.title
    if (body.beforeAfter.pairs !== undefined) update['beforeAfter.pairs'] = body.beforeAfter.pairs
  }

  if (body.testimonials) {
    if (body.testimonials.title !== undefined) {
      update['testimonials.title'] = body.testimonials.title
    }
    if (body.testimonials.items !== undefined) {
      update['testimonials.items'] = body.testimonials.items
    }
  }

  if (body.instagram) {
    if (body.instagram.title !== undefined) update['instagram.title'] = body.instagram.title
    if (body.instagram.handle !== undefined) update['instagram.handle'] = body.instagram.handle
    if (body.instagram.buttonText !== undefined) {
      update['instagram.buttonText'] = body.instagram.buttonText
    }
    if (body.instagram.images !== undefined) update['instagram.images'] = body.instagram.images
  }

  if (body.display) {
    if (body.display.showNavbar !== undefined) update['display.showNavbar'] = body.display.showNavbar
    if (body.display.showFooter !== undefined) update['display.showFooter'] = body.display.showFooter
  }

  return update
}

const getR2KeyFromImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return ''
  }

  if (
    !imageUrl.startsWith('http://') &&
    !imageUrl.startsWith('https://') &&
    !imageUrl.startsWith('blob:') &&
    !imageUrl.startsWith('data:')
  ) {
    return imageUrl.replace(/^\/+/, '')
  }

  try {
    const parsedUrl = new URL(imageUrl)
    const keyFromProxy = parsedUrl.searchParams.get('key')

    if (parsedUrl.pathname === '/api/upload/file' && keyFromProxy) {
      return keyFromProxy
    }

    if (!process.env.R2_PUBLIC_URL) {
      return ''
    }

    const publicUrl = new URL(process.env.R2_PUBLIC_URL)
    const publicBasePath = publicUrl.pathname.replace(/\/$/, '')
    const imagePath = decodeURIComponent(parsedUrl.pathname)

    if (parsedUrl.origin !== publicUrl.origin) {
      return ''
    }

    if (publicBasePath && imagePath.startsWith(`${publicBasePath}/`)) {
      return imagePath.slice(publicBasePath.length + 1)
    }

    if (!publicBasePath) {
      return imagePath.replace(/^\//, '')
    }
  } catch {
    return ''
  }

  return ''
}

const deleteR2ImageByKey = async (key) => {
  if (!key || !process.env.R2_BUCKET_NAME) {
    return
  }

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }),
  )
}

const collectSettingImageKeys = (settings) => {
  const keys = new Set()

  const addKey = (imageUrl) => {
    const key = getR2KeyFromImageUrl(imageUrl)

    if (key) {
      keys.add(key)
    }
  }

  addKey(settings?.hero?.image)
  addKey(settings?.bestSeller?.image)
  settings?.beforeAfter?.pairs?.forEach((pair) => {
    addKey(pair?.beforeImage)
    addKey(pair?.afterImage)
  })
  settings?.instagram?.images?.forEach((image) => {
    addKey(image?.image)
  })

  return keys
}

const cleanupReplacedImages = async (previousSettings, updatedSettings) => {
  const previousKeys = collectSettingImageKeys(previousSettings)
  const currentKeys = collectSettingImageKeys(updatedSettings)
  const keysToDelete = new Set(
    Array.from(previousKeys).filter((previousKey) => !currentKeys.has(previousKey)),
  )

  await Promise.all(
    Array.from(keysToDelete).map(async (key) => {
      try {
        await deleteR2ImageByKey(key)
      } catch (error) {
        console.warn(`R2 cleanup skipped for ${key}: ${error.message}`)
      }
    }),
  )
}

const getSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings()

    return res.status(200).json(settings)
  } catch (error) {
    return next(error)
  }
}

const updateSettings = async (req, res, next) => {
  try {
    const update = buildSettingsUpdate(req.body)

    if (!Object.keys(update).length) {
      const settings = await getOrCreateSettings()
      return res.status(200).json(settings)
    }

    const previousSettings = await getOrCreateSettings()

    const settings = await Setting.findOneAndUpdate(
      { key: SETTINGS_KEY },
      {
        $set: update,
        $setOnInsert: { key: SETTINGS_KEY },
      },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    )

    await cleanupReplacedImages(previousSettings, settings)

    return res.status(200).json(settings)
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  getSettings,
  updateSettings,
}
