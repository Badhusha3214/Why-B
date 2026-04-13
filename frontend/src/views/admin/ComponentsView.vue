<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { componentsAPI } from '@/api/index'
import AppModal from '@/components/admin/AppModal.vue'

interface Comp { _id: string; name: string; type: string; description: string; price: number; stock: number; sku: string; status: string }

const items       = ref<Comp[]>([])
const loading     = ref(true)
const showModal   = ref(false)
const deleteModal = ref(false)
const deleteId    = ref('')
const editing     = ref<Comp | null>(null)
const saving      = ref(false)
const form = ref({ name: '', type: 'part', description: '', price: 0, stock: 0, sku: '', status: 'active' })

function openAdd()    { editing.value = null; form.value = { name: '', type: 'part', description: '', price: 0, stock: 0, sku: '', status: 'active' }; showModal.value = true }
function openEdit(c: Comp) { editing.value = c; form.value = { name: c.name, type: c.type, description: c.description, price: c.price, stock: c.stock, sku: c.sku, status: c.status }; showModal.value = true }
function askDelete(id: string) { deleteId.value = id; deleteModal.value = true }

async function save() {
  saving.value = true
  try {
    if (editing.value) await componentsAPI.update(editing.value._id, form.value)
    else               await componentsAPI.create(form.value)
    await fetch_all()
    showModal.value = false
  } finally { saving.value = false }
}

async function confirmDelete() {
  await componentsAPI.remove(deleteId.value)
  deleteModal.value = false
  await fetch_all()
}

async function fetch_all() {
  const res = await componentsAPI.getAll()
  items.value = res.data.data?.components ?? res.data.data ?? []
}

onMounted(async () => { try { await fetch_all() } finally { loading.value = false } })
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-lg font-semibold text-gray-700">Components</h2>
      <button @click="openAdd" class="px-4 py-2 rounded-lg text-sm font-semibold" style="background:#ffde59;color:#545454">+ Add Component</button>
    </div>

    <div v-if="loading" class="text-gray-400 py-10 text-center">Loading...</div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Type</th>
            <th class="px-4 py-3">SKU</th>
            <th class="px-4 py-3">Price</th>
            <th class="px-4 py-3">Stock</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-400">No components yet.</td>
          </tr>
          <tr v-for="c in items" :key="c._id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-800">{{ c.name }}</td>
            <td class="px-4 py-3 text-gray-400 capitalize">{{ c.type }}</td>
            <td class="px-4 py-3 text-gray-400 font-mono text-xs">{{ c.sku || '-' }}</td>
            <td class="px-4 py-3">Rs {{ c.price?.toLocaleString() }}</td>
            <td class="px-4 py-3">{{ c.stock }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-xs" :class="c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">{{ c.status }}</span>
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
    <AppModal v-if="showModal" :title="editing ? 'Edit Component' : 'Add Component'" @close="showModal = false">
      <form @submit.prevent="save" class="p-4 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="label">Name *</label>
            <input v-model="form.name" required class="input" />
          </div>
          <div>
            <label class="label">Type</label>
            <select v-model="form.type" class="input">
              <option value="part">Part</option>
              <option value="variant">Variant</option>
              <option value="addon">Addon</option>
              <option value="bundle">Bundle</option>
            </select>
          </div>
          <div>
            <label class="label">SKU</label>
            <input v-model="form.sku" class="input" />
          </div>
          <div>
            <label class="label">Price</label>
            <input v-model.number="form.price" type="number" min="0" class="input" />
          </div>
          <div>
            <label class="label">Stock</label>
            <input v-model.number="form.stock" type="number" min="0" class="input" />
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
            <textarea v-model="form.description" class="input" rows="2" />
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <button type="button" @click="showModal = false" class="px-4 py-1.5 text-sm border border-gray-200 rounded-lg">Cancel</button>
          <button type="submit" :disabled="saving" class="px-4 py-1.5 text-sm rounded-lg font-semibold" style="background:#ffde59;color:#545454">{{ saving ? 'Saving...' : 'Save' }}</button>
        </div>
      </form>
    </AppModal>

    <!-- Delete Modal -->
    <AppModal v-if="deleteModal" title="Delete Component" @close="deleteModal = false">
      <p class="text-sm text-gray-600 p-4">Delete this component? This cannot be undone.</p>
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
