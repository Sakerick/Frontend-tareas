import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE = 'http://localhost:3100'

export const useAuthStore = defineStore('auth', () => {
  const csrfToken = ref<string>(localStorage.getItem('csrf_token') || '')
  const isAuthenticated = ref<boolean>(false)
  const user = ref<{ id: number; email: string } | null>(null)

  const login = async (email: string, apiKey: string) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      credentials: 'include', // Necesario para recibir/enviar cookies
      body: JSON.stringify({ email })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Error al iniciar sesión')
    }

    const data = await response.json()

    // Guardamos el CSRF token (la cookie JWT la maneja el browser solo)
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
    if (!csrfToken.value) return false
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

  return { csrfToken, isAuthenticated, user, login, logout, checkAuth }
})