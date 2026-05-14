import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE = 'https://localhost:3100'

const readCookie = (name: string): string => {
  if (typeof document === 'undefined') return ''
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || ''
  return ''
}

export const useAuthStore = defineStore('auth', () => {
  const csrfToken = ref<string>(localStorage.getItem('csrf_token') || readCookie('csrf_token') || '')
  const isAuthenticated = ref<boolean>(false)
  const user = ref<{ id: number; email: string; isAdmin?: boolean } | null>(null)

  const login = async (email: string, password: string, apiKey: string) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Error al iniciar sesión')
    }

    const data = await response.json()

    csrfToken.value = data.csrfToken
    localStorage.setItem('csrf_token', data.csrfToken)
    isAuthenticated.value = true
    user.value = data.usuario
  }

  const logout = async () => {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'x-csrf-token': csrfToken.value }
    })

    csrfToken.value = ''
    isAuthenticated.value = false
    user.value = null
    localStorage.removeItem('csrf_token')
  }

  // Verificar si la sesión sigue activa (útil al recargar la página)
  const checkAuth = async () => {
    if (!csrfToken.value) {
      csrfToken.value = readCookie('csrf_token')
      if (!csrfToken.value) return false
    }
    try {
      const response = await fetch(`${API_BASE}/api/auth/verificar`, {
        credentials: 'include',
        headers: { 'x-csrf-token': csrfToken.value }
      })
      if (response.ok) {
        const data = await response.json()
        isAuthenticated.value = true
        user.value = data.usuario
        return true
      }
    } catch {
      // sesión inválida
    }
    isAuthenticated.value = false
    csrfToken.value = ''
    localStorage.removeItem('csrf_token')
    return false
  }

  const checkSession = async () => {
    return await checkAuth()
  }

  return { csrfToken, isAuthenticated, user, login, logout, checkAuth, checkSession }
})