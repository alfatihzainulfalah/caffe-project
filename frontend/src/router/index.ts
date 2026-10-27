import { createRouter, createWebHistory } from 'vue-router'
import MobileLayoutCustomer from '@/layouts/MobileLayoutCustomer.vue'
import MobileLayoutAdmin from '@/layouts/MobileLayoutAdmin.vue'
import { useAuth } from '@/composables/useAuth'

let authInitialized = false

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- Admin Auth ---
    {
      path: '/login',
      name: 'admin-login',
      component: () => import('@/pages/auth/AdminLoginPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'admin-register',
      component: () => import('@/pages/auth/AdminRegisterPage.vue'),
      meta: { guest: true },
    },

    // --- Customer (tanpa login) ---
    {
      path: '/',
      component: MobileLayoutCustomer,
      children: [
        { path: '', redirect: { name: 'customer-menu' } },
        {
          path: 'menu',
          name: 'customer-menu',
          component: () => import('@/modules/customers/menu/MenuPage.vue'),
        },
        {
          path: 'pesanan',
          name: 'customer-pesanan',
          component: () => import('@/modules/customers/pesanan/PesananPage.vue'),
        },
        {
          path: 'riwayat',
          name: 'customer-riwayat',
          component: () => import('@/modules/customers/riwayat/RiwayatPage.vue'),
        },
      ],
    },

    // --- Admin (perlu login) ---
    {
      path: '/admin',
      component: MobileLayoutAdmin,
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        { path: '', redirect: { name: 'admin-dashboard' } },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/modules/admin/dashboard/AdminDashboardPage.vue'),
        },
      ],
    },
  ],
})

// --- Navigation Guards ---
router.beforeEach(async (to, _from, next) => {
  const requiresAuth = to.matched.some(r => r.meta.requiresAuth)

  // Halaman customer tidak perlu cek auth sama sekali
  if (!requiresAuth && !to.meta.guest) {
    return next()
  }

  // Init auth sekali saja (untuk admin routes & guest check)
  if (!authInitialized) {
    const { init } = useAuth()
    try {
      await init()
    } catch {
      // Supabase gagal? Lanjut saja
    }
    authInitialized = true
  }

  const { isLoggedIn, isAdmin } = useAuth()

  // Halaman guest (/login) - redirect kalau sudah login admin
  if (to.meta.guest && isLoggedIn.value && isAdmin.value) {
    return next({ name: 'admin-dashboard' })
  }

  // Halaman admin - harus login & role admin
  if (requiresAuth) {
    if (!isLoggedIn.value) {
      return next({ name: 'admin-login' })
    }
    if (to.matched.some(r => r.meta.role === 'admin') && !isAdmin.value) {
      return next({ name: 'admin-login' })
    }
  }

  next()
})

export default router
