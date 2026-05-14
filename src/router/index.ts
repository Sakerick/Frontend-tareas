import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('@/components/LoginDesign.vue') },
    {
      path: '/tareas',
      component: () => import('@/components/Tareas.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      component: () => import('@/components/AdminPanel.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    { path: '/', redirect: '/tareas' }
  ]
})

let initialized = false;

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!initialized) {
    await auth.checkSession()
    initialized = true
  }

  if (to.meta.requiresAuth) {
    const valid = auth.isAuthenticated || await auth.checkAuth()
    if (!valid) return '/login'
  }

  if (to.meta.requiresAdmin && !auth.user?.isAdmin) {
    return '/tareas'
  }

  if (to.path === '/login' && auth.isAuthenticated) return '/tareas'
})

export default router