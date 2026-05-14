import { useAuthStore } from '@/stores/auth'

const API_BASE = 'https://localhost:3100'

const readCookie = (name: string): string => {
  if (typeof document === 'undefined') return ''
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || ''
  return ''
}

export const useApi = () => {
  const auth = useAuthStore()

  const fetchWithAuth = async (path: string, options: RequestInit = {}) => {
    const csrfToken = auth.csrfToken || readCookie('csrf_token')
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (csrfToken) {
      Object.assign(headers, { 'x-csrf-token': csrfToken })
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include', // Envía la cookie JWT automáticamente
      headers
    })

    if (response.status === 401) {
      auth.isAuthenticated = false
      // Redirigir al login si la sesión expiró
      window.location.href = '/login'
    }

    return response
  }

  return { fetchWithAuth }
}