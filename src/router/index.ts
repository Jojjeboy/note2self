import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/workspace/:id',
      name: 'workspace',
      component: () => import('../views/WorkspaceView.vue'),
      props: true
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
  ],
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const { user, loading, waitForAuth } = useAuth()

  // Wait for auth to init if not already
  if (loading.value) {
    await waitForAuth()
  }

  const isPublic = to.name === 'login'
  const isAuthenticated = !!user.value

  if (!isPublic && !isAuthenticated) {
    next('/login')
  } else if (isPublic && isAuthenticated) {
    next('/') // Redirect to home if already logged in and trying to access login
  } else {
    next()
  }
})

export default router
