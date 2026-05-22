const isBrowser = typeof window !== 'undefined'
const localHostnames = new Set(['localhost', '127.0.0.1', '::1'])
const isLocalHost = isBrowser && localHostnames.has(window.location.hostname)
const defaultApiOrigin = isLocalHost ? 'http://localhost:8081' : window.location.origin

export const API_BASE_URL = import.meta.env.VITE_API_URL || `${defaultApiOrigin}/api`
export const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_URL || defaultApiOrigin
