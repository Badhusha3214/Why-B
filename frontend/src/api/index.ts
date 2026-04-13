import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/admin/login'
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
  // Upload a single image file; returns { url: '/uploads/filename.jpg' }
  uploadImage: (file: File) => {
    const form = new FormData()
    form.append('image', file)
    return api.post<{ status: string; url: string }>('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default api
