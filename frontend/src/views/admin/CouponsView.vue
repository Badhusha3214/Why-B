<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { couponsAPI } from '@/api/index'
import AppModal from '@/components/admin/AppModal.vue'

interface Coupon { _id: string; code: string; type: string; value: number; description: string; status: string; minOrderAmount: number; maxUses: number | null; usedCount: number; expiresAt: string | null }

const items       = ref<Coupon[]>([])
const loading     = ref(true)
const showModal   = ref(false)
const deleteModal = ref(false)
const deleteId    = ref('')
const editing     = ref<Coupon | null>(null)
const saving      = ref(false)
const form = ref({ code: '', type: 'percentage', value: 0, description: '', status: 'active', minOrderAmount: 0, maxUses: '', expiresAt: '' })

function openAdd()    { editing.value = null; form.value = { code: '', type: 'percentage', value: 0, description: '', status: 'active', minOrderAmount: 0, maxUses: '', expiresAt: '' }; showModal.value = true }
function openEdit(c: Coupon) {
  editing.value = c
  form.value = {
    code: c.code, type: c.type, value: c.value, description: c.description,
    status: c.status, minOrderAmount: c.minOrderAmount,
    maxUses: c.maxUses != null ? String(c.maxUses) : '',
    expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
  }
  showModal.value = true
}
function askDelete(id: string) { deleteId.value = id; deleteModal.value = true }

async function save() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      maxUses: form.value.maxUses !== '' ? Number(form.value.maxUses) : null,
      expiresAt: form.value.expiresAt || null,
    }
    if (editing.value) await couponsAPI.update(editing.value._id, payload)
    else               await couponsAPI.create(payload)
    await fetch_all()
    showModal.value = false
  } finally { saving.value = false }
}

async function confirmDelete() {
  await couponsAPI.remove(deleteId.value)
  deleteModal.value = false
  await fetch_all()
}

async function fetch_all() {
  const res = await couponsAPI.getAll()
  items.value = res.data.data?.coupons ?? res.data.data ?? []
}

onMounted(async () => { try { await fetch_all() } finally { loading.value = false } })
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-lg font-semibold text-gray-700">Coupons</h2>
      <button @click="openAdd" class="px-4 py-2 rounded-lg text-sm font-semibold" style="background:#ffde59;color:#545454">+ Add Coupon</button>
    </div>

    <div v-if="loading" class="text-gray-400 py-10 text-center">Loading...</div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table class="w-full min-w-max text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
            <th class="px-4 py-3">Code</th>
            <th class="px-4 py-3">Type</th>
            <th class="px-4 py-3">Value</th>
            <th class="px-4 py-3">Used</th>
            <th class="px-4 py-3">Expires</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-400">No coupons yet.</td>
          </tr>
          <tr v-for="c in items" :key="c._id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 font-mono font-bold text-gray-800 tracking-wide">{{ c.code }}</td>
            <td class="px-4 py-3 capitalize text-gray-500">{{ c.type }}</td>
            <td class="px-4 py-3 font-semibold">{{ c.type === 'percentage' ? c.value + '%' : 'Rs ' + c.value }}</td>
            <td class="px-4 py-3 text-gray-400">{{ c.usedCount }}{{ c.maxUses != null ? ' / ' + c.maxUses : '' }}</td>
            <td class="px-4 py-3 text-gray-400 text-xs">{{ c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never' }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-xs capitalize" :class="c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">{{ c.status }}</span>
            </td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="openEdit(c)" class="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">Edit</button>
              <button @click="askDelete(c._id)" class="text-xs px-3 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form Modal -->
    <AppModal v-if="showModal" :title="editing ? 'Edit Coupon' : 'Add Coupon'" @close="showModal = false">
      <form @submit.prevent="save" class="p-4 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="label">Code *</label>
            <input v-model="form.code" required class="input uppercase" style="text-transform:uppercase" />
          </div>
          <div>
            <label class="label">Type</label>
            <select v-model="form.type" class="input">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed (Rs)</option>
            </select>
          </div>
          <div>
            <label class="label">Value *</label>
            <input v-model.number="form.value" type="number" min="0" required class="input" />
          </div>
          <div>
            <label class="label">Min Order Amount</label>
            <input v-model.number="form.minOrderAmount" type="number" min="0" class="input" />
          </div>
          <div>
            <label class="label">Max Uses</label>
            <input v-model="form.maxUses" type="number" min="0" class="input" placeholder="unlimited" />
          </div>
          <div>
            <label class="label">Expires At</label>
            <input v-model="form.expiresAt" type="date" class="input" />
          </div>
          <div>
            <label class="label">Status</label>
            <select v-model="form.status" class="input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="label">Description</label>
            <input v-model="form.description" class="input" />
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <button type="button" @click="showModal = false" class="px-4 py-1.5 text-sm border border-gray-200 rounded-lg">Cancel</button>
          <button type="submit" :disabled="saving" class="px-4 py-1.5 text-sm rounded-lg font-semibold" style="background:#ffde59;color:#545454">{{ saving ? 'Saving...' : 'Save' }}</button>
        </div>
      </form>
    </AppModal>

    <!-- Delete Modal -->
    <AppModal v-if="deleteModal" title="Delete Coupon" @close="deleteModal = false">
      <p class="text-sm text-gray-600 p-4">Delete this coupon? This cannot be undone.</p>
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
 