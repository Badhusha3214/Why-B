import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { authStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/ContactView.vue'),
    },

    // Admin login (no layout)
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/LoginView.vue'),
    },

    // Admin panel (with layout + auth guard)
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '',          name: 'dashboard',  component: () => import('@/views/admin/DashboardView.vue') },
        { path: 'products',  name: 'products',   component: () => import('@/views/admin/ProductsView.vue') },
        { path: 'categories',name: 'categories', component: () => import('@/views/admin/CategoriesView.vue') },
        { path: 'tags',      name: 'tags',       component: () => import('@/views/admin/TagsView.vue') },
        { path: 'components',name: 'components', component: () => import('@/views/admin/ComponentsView.vue') },
        { path: 'orders',    name: 'orders',     component: () => import('@/views/admin/OrdersView.vue') },
        { path: 'customers', name: 'customers',  component: () => import('@/views/admin/CustomersView.vue') },
        { path: 'coupons',   name: 'coupons',    component: () => import('@/views/admin/CouponsView.vue') },
        { path: 'banners',   name: 'banners',    component: () => import('@/views/admin/BannersView.vue') },
        { path: 'reviews',   name: 'reviews',    component: () => import('@/views/admin/ReviewsView.vue') },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/admin/login')
  } else if (to.path === '/admin/login' && authStore.isLoggedIn) {
    next('/admin')
  } else {
    next()
  }
})

export default router
