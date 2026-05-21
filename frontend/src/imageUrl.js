import { API_BASE_URL } from './apiConfig'

const addImageCacheBuster = (imageUrl) => {
  if (!imageUrl || imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
    return imageUrl
  }

  const separator = imageUrl.includes('?') ? '&' : '?'

  return `${imageUrl}${separator}v=${Date.now()}`
}

export const getStoredImageKey = (imageUrl) => {
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
    const key = parsedUrl.searchParams.get('key')

    if (parsedUrl.pathname === '/api/upload/file' && key) {
      return key
    }
  } catch {
    return ''
  }

  return ''
}

export const resolveStoredImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return ''
  }

  if (imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')) {
    return imageUrl
  }

  const storedKey = getStoredImageKey(imageUrl)

  if (storedKey) {
    return `${API_BASE_URL}/upload/file?key=${encodeURIComponent(storedKey)}&v=${Date.now()}`
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return addImageCacheBuster(imageUrl)
  }

  return ''
}
