import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Index from '@/pages/index.vue'
import Login from '@/pages/login.vue'



const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('@/components/LoginDesign.vue') },
    { 
      path: '/tareas', 
      component: () => import('@/components/Tareas.vue'),
      meta: { requiresAuth: true } // Marcamos que requiere login
    },
    { path: '/', redirect: '/tareas' }
  ]
})

// Bandera para saber si ya verificamos la sesión al cargar la página
let initialized = false;

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  // Si es la primera vez que carga la app (F5), verificamos sesión con el servidor
  if (!initialized) {
    await auth.checkSession();
    initialized = true;
  }

  // Lógica de protección
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && auth.isAuthenticated) {
    next('/tareas'); // Si ya está logueado, no lo dejes ir al login
  } else {
    next();
  }
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