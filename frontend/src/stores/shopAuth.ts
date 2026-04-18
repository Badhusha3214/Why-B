import { reactive } from 'vue'

interface ShopUser {
  _id: string
  name: string
  email: string
  role: string
}
interface Customer {
  _id: string
  name: string
  email: string
  phone: string
  addresses: Address[]
}
export interface Address {
  _id?: string
  label: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

const state = reactive({
  token:    localStorage.getItem('shop_token') || '',
  user:     JSON.parse(localStorage.getItem('shop_user') || 'null') as ShopUser | null,
  customer: JSON.parse(localStorage.getItem('shop_customer') || 'null') as Customer | null,
})

export const shopAuth = {
  get isLoggedIn() { return !!state.token },
  get token()      { return state.token },
  get user()       { return state.user },
  get customer()   { return state.customer },

  setAuth(token: string, user: ShopUser, customer?: Customer) {
    state.token    = token
    state.user     = user
    state.customer = customer ?? null
    localStorage.setItem('shop_token', token)
    localStorage.setItem('shop_user', JSON.stringify(user))
    if (customer) localStorage.setItem('shop_customer', JSON.stringify(customer))
  },

  setCustomer(customer: Customer) {
    state.customer = customer
    localStorage.setItem('shop_customer', JSON.stringify(customer))
  },

  clearAuth() {
    state.token    = ''
    state.user     = null
    state.customer = null
    localStorage.removeItem('shop_token')
    localStorage.removeItem('shop_user')
    localStorage.removeItem('shop_customer')
  },
}
