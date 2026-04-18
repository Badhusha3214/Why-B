import { reactive, computed } from 'vue'

export interface CartItem {
  productId: string
  name: string
  price: number
  salePrice?: number
  image: string
  quantity: number
}

const STORAGE_KEY = 'frisb_cart'

function load(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}
function save(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const state = reactive({ items: load() })

export const cart = {
  get items() { return state.items },

  itemCount: computed(() => state.items.reduce((s, i) => s + i.quantity, 0)),

  subtotal: computed(() =>
    state.items.reduce((s, i) => s + (i.salePrice ?? i.price) * i.quantity, 0)
  ),

  add(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
    const existing = state.items.find(i => i.productId === item.productId)
    if (existing) {
      existing.quantity += item.quantity ?? 1
    } else {
      state.items.push({ ...item, quantity: item.quantity ?? 1 })
    }
    save(state.items)
  },

  remove(productId: string) {
    const idx = state.items.findIndex(i => i.productId === productId)
    if (idx !== -1) { state.items.splice(idx, 1); save(state.items) }
  },

  setQty(productId: string, qty: number) {
    const item = state.items.find(i => i.productId === productId)
    if (item) { item.quantity = Math.max(1, qty); save(state.items) }
  },

  clear() { state.items.splice(0); save([]) },
}
