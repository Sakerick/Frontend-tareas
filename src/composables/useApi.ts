import { useAuthStore } from '@/stores/auth'

const API_BASE = 'http://localhost:3100'

export const useApi = () => {
  const auth = useAuthStore()

  const fetchWithAuth = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include', // Envía la cookie JWT automáticamente
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': auth.csrfToken, // CSRF en cada request
        ...options.headers
      }
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