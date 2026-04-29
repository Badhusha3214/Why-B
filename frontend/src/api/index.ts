import axios from 'axios'
import { shopAuth } from '@/stores/shopAuth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  // Admin token takes priority, then shop token
  const token = localStorage.getItem('admin_token') || localStorage.getItem('shop_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url ?? ''
    if (error.response?.status === 401) {
      if (url.includes('/shop/') || localStorage.getItem('shop_token')) {
        shopAuth.clearAuth()
        window.location.href = '/login'
      } else {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  adminLogin: (d: { email: string; password: string }) => api.post('/auth/admin/login', d),
  logout: () => api.post('/auth/logout'),
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
}

export const productsAPI = {
  getAll:  (p?: object)              => api.get('/products', { params: p }),
  create:  (d: object)               => api.post('/products', d),
  update:  (id: string, d: object)   => api.patch(`/products/${id}`, d),
  remove:  (id: string)              => api.delete(`/products/${id}`),
}

export const categoriesAPI = {
  getAll:  ()                        => api.get('/categories'),
  create:  (d: object)               => api.post('/categories', d),
  update:  (id: string, d: object)   => api.patch(`/categories/${id}`, d),
  remove:  (id: string)              => api.delete(`/categories/${id}`),
}

export const tagsAPI = {
  getAll:  ()                        => api.get('/tags'),
  create:  (d: object)               => api.post('/tags', d),
  update:  (id: string, d: object)   => api.patch(`/tags/${id}`, d),
  remove:  (id: string)              => api.delete(`/tags/${id}`),
}

export const componentsAPI = {
  getAll:  (p?: object)              => api.get('/components', { params: p }),
  create:  (d: object)               => api.post('/components', d),
  update:  (id: string, d: object)   => api.patch(`/components/${id}`, d),
  remove:  (id: string)              => api.delete(`/components/${id}`),
}

export const ordersAPI = {
  getAll:         (p?: object)                              => api.get('/orders', { params: p }),
  updateStatus:   (id: string, status: string)              => api.patch(`/orders/${id}/status`, { status }),
  updatePayment:  (id: string, paymentStatus: string)       => api.patch(`/orders/${id}/payment-status`, { paymentStatus }),
  remove:         (id: string)                              => api.delete(`/orders/${id}`),
}

export const customersAPI = {
  getAll:  (p?: object)              => api.get('/customers', { params: p }),
  update:  (id: string, d: object)   => api.patch(`/customers/${id}`, d),
  remove:  (id: string)              => api.delete(`/customers/${id}`),
}

export const couponsAPI = {
  getAll:  ()                        => api.get('/coupons'),
  create:  (d: object)               => api.post('/coupons', d),
  update:  (id: string, d: object)   => api.patch(`/coupons/${id}`, d),
  remove:  (id: string)              => api.delete(`/coupons/${id}`),
}

export const bannersAPI = {
  getAll:   ()                       => api.get('/banners'),
  create:   (d: object)              => api.post('/banners', d),
  update:   (id: string, d: object)  => api.patch(`/banners/${id}`, d),
  remove:   (id: string)             => api.delete(`/banners/${id}`),
  reorder:  (items: object[])        => api.post('/banners/reorder', { items }),
}

export const reviewsAPI = {
  getAll:         (p?: object)                                   => api.get('/reviews', { params: p }),
  updateStatus:   (id: string, d: { status: string; adminReply?: string }) => api.patch(`/reviews/${id}/status`, d),
  remove:         (id: string)                                   => api.delete(`/reviews/${id}`),
}

export const uploadAPI = {
  // 1. Get a presigned PUT URL + final public URL from the backend (admin-only)
  // 2. PUT the file directly to R2 using the presigned URL (no server bandwidth)
  uploadImage: async (file: File): Promise<{ data: { status: string; url: string } }> => {
    const presignRes = await api.get<{ status: string; presignedUrl: string; url: string }>(
      '/upload/presign',
      { params: { contentType: file.type } }
    )
    const { presignedUrl, url } = presignRes.data
    await fetch(presignedUrl, {
      method:  'PUT',
      body:    file,
      headers: { 'Content-Type': file.type },
    })
    return { data: { status: 'success', url } }
  },
}

export default api

// ── Consumer / Shop API ────────────────────────────────────────────────────
export const shopAuthAPI = {
  register: (d: { name: string; email: string; password: string }) => api.post('/auth/register', d),
  login:    (d: { email: string; password: string })               => api.post('/auth/login', d),
}

export const shopAPI = {
  getMe:          ()                  => api.get('/shop/me'),
  updateMe:       (d: object)         => api.patch('/shop/me', d),
  getMyOrders:    ()                  => api.get('/shop/orders'),
  createOrder:    (d: object)         => api.post('/shop/orders', d),
  validateCoupon: (code: string)      => api.get(`/shop/coupon/${code}`),
  submitReview:   (d: object)         => api.post('/shop/reviews', d),
}

export const publicAPI = {
  getProducts:    (p?: object)        => api.get('/products',   { params: p }),
  getProduct:     (id: string)        => api.get(`/products/${id}`),
  getCategories:  ()                  => api.get('/categories'),
  getTags:        ()                  => api.get('/tags'),
  getBanners:     (p?: object)        => api.get('/banners',    { params: p }),
  getReviews:     (p?: object)        => api.get('/reviews',    { params: p }),
}
