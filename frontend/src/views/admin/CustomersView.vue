<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { customersAPI } from '@/api/index'
import AppModal from '@/components/admin/AppModal.vue'

interface Customer { _id: string; name: string; email: string; phone: string; status: string; totalOrders: number; totalSpent: number; notes: string }

const items       = ref<Customer[]>([])
const loading     = ref(true)
const showModal   = ref(false)
const deleteModal = ref(false)
const deleteId    = ref('')
const editing     = ref<Customer | null>(null)
const saving      = ref(false)
const form        = ref({ status: 'active', notes: '' })

function openEdit(c: Customer) { editing.value = c; form.value = { status: c.status, notes: c.notes }; showModal.value = true }
function askDelete(id: string) { deleteId.value = id; deleteModal.value = true }

async function save() {
  if (!editing.value) return
  saving.value = true
  try {
    await customersAPI.update(editing.value._id, form.value)
    await fetch_all()
    showModal.value = false
  } finally { saving.value = false }
}

async function confirmDelete() {
  await customersAPI.remove(deleteId.value)
  deleteModal.value = false
  await fetch_all()
}

async function fetch_all() {
  const res = await customersAPI.getAll()
  items.value = res.data.data?.customers ?? res.data.data ?? []
}

onMounted(async () => { try { await fetch_all() } finally { loading.value = false } })

function statusColor(s: string) {
  return { active: 'bg-green-100 text-green-700', banned: 'bg-red-100 text-red-600' }[s] ?? 'bg-gray-100 text-gray-500'
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-lg font-semibold text-gray-700">Customers</h2>
    </div>

    <div v-if="loading" class="text-gray-400 py-10 text-center">Loading...</div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Phone</th>
            <th class="px-4 py-3">Orders</th>
            <th class="px-4 py-3">Spent</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-400">No customers yet.</td>
          </tr>
          <tr v-for="c in items" :key="c._id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-800">{{ c.name }}</td>
            <td class="px-4 py-3 text-gray-400">{{ c.email }}</td>
            <td class="px-4 py-3 text-gray-400">{{ c.phone || '-' }}</td>
            <td class="px-4 py-3">{{ c.totalOrders }}</td>
            <td class="px-4 py-3 font-medium">Rs {{ c.totalSpent?.toLocaleString() }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-xs capitalize" :class="statusColor(c.status)">{{ c.status }}</span>
            </td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="openEdit(c)" class="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">Edit</button>
              <button @click="askDelete(c._id)" class="text-xs px-3 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <AppModal v-if="showModal" title="Edit Customer" @close="showModal = false">
      <form @submit.prevent="save" class="p-4 space-y-4">
        <div>
          <label class="label">Status</label>
          <select v-model="form.status" class="input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        </div>
        <div>
          <label class="label">Notes</label>
          <textarea v-model="form.notes" class="input" rows="3" />
        </div>
        <div class="flex gap-2 justify-end">
          <button type="button" @click="showModal = false" class="px-4 py-1.5 text-sm border border-gray-200 rounded-lg">Cancel</button>
          <button type="submit" :disabled="saving" class="px-4 py-1.5 text-sm rounded-lg font-semibold" style="background:#ffde59;color:#545454">{{ saving ? 'Saving...' : 'Save' }}</button>
        </div>
      </form>
    </AppModal>

    <!-- Delete Modal -->
    <AppModal v-if="deleteModal" title="Delete Customer" @close="deleteModal = false">
      <p class="text-sm text-gray-600 p-4">Delete this customer? This cannot be undone.</p>
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
