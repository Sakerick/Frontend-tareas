import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Index from '@/pages/index.vue'
import Login from '@/pages/login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Index,
      meta: { requiresAuth: true } // ← Marca rutas protegidas
    },
    {
      path: '/login',
      component: Login,
      meta: { requiresAuth: false }
    }
  ]
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth) {
    // Si no hay token en memoria, verificamos con el backend
    const valid = auth.isAuthenticated || await auth.checkAuth()
    if (!valid) return '/login'
  }

  // Si ya está autenticado y va al login, redirigir al inicio
  if (to.path === '/login' && auth.isAuthenticated) return '/'
})

export default router