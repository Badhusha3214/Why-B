import { reactive } from 'vue'

interface AdminUser { _id: string; name: string; email: string; role: string }

const state = reactive({
  token: localStorage.getItem('admin_token') || '',
  user:  JSON.parse(localStorage.getItem('admin_user') || 'null') as AdminUser | null,
})

export const authStore = {
  get isLoggedIn() { return !!state.token },
  get user()       { return state.user },

  setAuth(token: string, user: AdminUser) {
    state.token = token
    state.user  = user
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_user', JSON.stringify(user))
  },

  clearAuth() {
    state.token = ''
    state.user  = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  },
}
