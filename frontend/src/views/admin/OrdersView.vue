<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ordersAPI } from '@/api/index'
import AppModal from '@/components/admin/AppModal.vue'

interface Order {
  _id: string; status: string; paymentStatus: string; paymentMethod: string
  totalAmount: number; discountAmount: number; notes: string
  customer?: { name: string; email: string }
  shippingAddress?: { street: string; city: string; state: string; country: string; zip: string }
  items?: any[]
  createdAt: string
}

const items         = ref<Order[]>([])
const loading       = ref(true)
const statusModal   = ref(false)
const deleteModal   = ref(false)
const deleteId      = ref('')
const editing       = ref<Order | null>(null)
const saving        = ref(false)
const newStatus     = ref('')
const newPayment    = ref('')

const STATUS_OPTIONS  = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
const PAYMENT_OPTIONS = ['pending', 'paid', 'failed', 'refunded']

function openStatus(o: Order) { editing.value = o; newStatus.value = o.status; newPayment.value = o.paymentStatus; statusModal.value = true }
function askDelete(id: string) { deleteId.value = id; deleteModal.value = true }

async function saveStatus() {
  if (!editing.value) return
  saving.value = true
  try {
    if (newStatus.value !== editing.value.status)
      await ordersAPI.updateStatus(editing.value._id, newStatus.value)
    if (newPayment.value !== editing.value.paymentStatus)
      await ordersAPI.updatePayment(editing.value._id, newPayment.value)
    await fetch_all()
    statusModal.value = false
  } finally { saving.value = false }
}

async function confirmDelete() {
  await ordersAPI.remove(deleteId.value)
  deleteModal.value = false
  await fetch_all()
}

async function fetch_all() {
  const res = await ordersAPI.getAll({ populate: 'customer' })
  items.value = res.data.data?.orders ?? res.data.data ?? []
}

onMounted(async () => { try { await fetch_all() } finally { loading.value = false } })

function statusColor(s: string) {
  return { delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600', shipped: 'bg-blue-100 text-blue-700', processing: 'bg-yellow-100 text-yellow-700' }[s] ?? 'bg-gray-100 text-gray-500'
}
function payColor(s: string) {
  return { paid: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-600', refunded: 'bg-purple-100 text-purple-700' }[s] ?? 'bg-gray-100 text-gray-500'
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-lg font-semibold text-gray-700">Orders</h2>
    </div>

    <div v-if="loading" class="text-gray-400 py-10 text-center">Loading...</div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
            <th class="px-4 py-3">Order ID</th>
            <th class="px-4 py-3">Customer</th>
            <th class="px-4 py-3">Total</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Payment</th>
            <th class="px-4 py-3">Date</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-400">No orders yet.</td>
          </tr>
          <tr v-for="o in items" :key="o._id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ o._id.slice(-8) }}</td>
            <td class="px-4 py-3">
              <p class="font-medium text-gray-800">{{ o.customer?.name ?? '-' }}</p>
              <p class="text-xs text-gray-400">{{ o.customer?.email }}</p>
            </td>
            <td class="px-4 py-3 font-semibold">Rs {{ o.totalAmount?.toLocaleString() }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-xs capitalize" :class="statusColor(o.status)">{{ o.status }}</span>
            </td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-xs capitalize" :class="payColor(o.paymentStatus)">{{ o.paymentStatus }}</span>
            </td>
            <td class="px-4 py-3 text-gray-400 text-xs">{{ new Date(o.createdAt).toLocaleDateString() }}</td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="openStatus(o)" class="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">Update</button>
              <button @click="askDelete(o._id)" class="text-xs px-3 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Status Modal -->
    <AppModal v-if="statusModal" title="Update Order" @close="statusModal = false">
      <div class="p-4 space-y-4">
        <div>
          <label class="label">Order Status</label>
          <select v-model="newStatus" class="input">
            <option v-for="s in STATUS_OPTIONS" :key="s" :value="s" class="capitalize">{{ s }}</option>
          </select>
        </div>
        <div>
          <label class="label">Payment Status</label>
          <select v-model="newPayment" class="input">
            <option v-for="s in PAYMENT_OPTIONS" :key="s" :value="s" class="capitalize">{{ s }}</option>
          </select>
        </div>
        <div v-if="editing?.notes" class="text-xs text-gray-500 bg-gray-50 rounded p-2">
          Note: {{ editing.notes }}
        </div>
      </div>
      <template #footer>
        <div class="flex gap-2 p-4 justify-end">
          <button @click="statusModal = false" class="px-4 py-1.5 text-sm border border-gray-200 rounded-lg">Cancel</button>
          <button @click="saveStatus" :disabled="saving" class="px-4 py-1.5 text-sm rounded-lg font-semibold" style="background:#ffde59;color:#545454">{{ saving ? 'Saving...' : 'Save' }}</button>
        </div>
      </template>
    </AppModal>

    <!-- Delete Modal -->
    <AppModal v-if="deleteModal" title="Delete Order" @close="deleteModal = false">
      <p class="text-sm text-gray-600 p-4">Delete this order? This cannot be undone.</p>
      <template #footer>
        <div class="flex gap-2 p-4 justify-end">
          <button @click="deleteModal = false" class="px-4 py-1.5 text-sm border border-gray-200 rounded-lg">Cancel</button>
          <button @click="confirmDelete" class="px-4 py-1.5 text-sm rounded-lg text-white" style="background:#ef4444">Delete</button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
.label { @apply block text-xs font-medium text-gray-600 mb-1; }
.input  { @apply w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300; }
</style>
