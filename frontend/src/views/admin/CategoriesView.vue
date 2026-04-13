<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { categoriesAPI } from '@/api/index'
import AppModal from '@/components/admin/AppModal.vue'

interface Category { _id: string; name: string; description: string; status: string; parent?: any }

const items       = ref<Category[]>([])
const loading     = ref(true)
const showModal   = ref(false)
const deleteModal = ref(false)
const deleteId    = ref('')
const editing     = ref<Category | null>(null)
const saving      = ref(false)
const form        = ref({ name: '', description: '', status: 'active', parent: '' })

function openAdd()        { editing.value = null; form.value = { name: '', description: '', status: 'active', parent: '' }; showModal.value = true }
function openEdit(c: Category) { editing.value = c; form.value = { name: c.name, description: c.description, status: c.status, parent: c.parent?._id ?? c.parent ?? '' }; showModal.value = true }
function askDelete(id: string) { deleteId.value = id; deleteModal.value = true }

async function save() {
  saving.value = true
  try {
    const payload = { ...form.value, parent: form.value.parent || undefined }
    if (editing.value) await categoriesAPI.update(editing.value._id, payload)
    else               await categoriesAPI.create(payload)
    await fetch_all()
    showModal.value = false
  } finally { saving.value = false }
}

async function confirmDelete() {
  await categoriesAPI.remove(deleteId.value)
  deleteModal.value = false
  await fetch_all()
}

async function fetch_all() {
  const res = await categoriesAPI.getAll()
  items.value = res.data.data?.categories ?? res.data.data ?? []
}

onMounted(async () => { try { await fetch_all() } finally { loading.value = false } })
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-lg font-semibold text-gray-700">Categories</h2>
      <button @click="openAdd" class="px-4 py-2 rounded-lg text-sm font-semibold" style="background:#ffde59;color:#545454">+ Add Category</button>
    </div>

    <div v-if="loading" class="text-gray-400 py-10 text-center">Loading...</div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Description</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-gray-400">No categories yet.</td>
          </tr>
          <tr v-for="c in items" :key="c._id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-800">{{ c.name }}</td>
            <td class="px-4 py-3 text-gray-400">{{ c.description || '-' }}</td>
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
    <AppModal v-if="showModal" :title="editing ? 'Edit Category' : 'Add Category'" @close="showModal = false">
      <form @submit.prevent="save" class="p-4 space-y-4">
        <div>
          <label class="label">Name *</label>
          <input v-model="form.name" required class="input" />
        </div>
        <div>
          <label class="label">Description</label>
          <input v-model="form.description" class="input" />
        </div>
        <div>
          <label class="label">Status</label>
          <select v-model="form.status" class="input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label class="label">Parent Category</label>
          <select v-model="form.parent" class="input">
            <option value="">-- none --</option>
            <option v-for="c in items.filter(x => x._id !== editing?._id)" :key="c._id" :value="c._id">{{ c.name }}</option>
          </select>
        </div>
        <div class="flex gap-2 justify-end">
          <button type="button" @click="showModal = false" class="px-4 py-1.5 text-sm border border-gray-200 rounded-lg">Cancel</button>
          <button type="submit" :disabled="saving" class="px-4 py-1.5 text-sm rounded-lg font-semibold" style="background:#ffde59;color:#545454">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Delete Modal -->
    <AppModal v-if="deleteModal" title="Delete Category" @close="deleteModal = false">
      <p class="text-sm text-gray-600 p-4">Delete this category? This cannot be undone.</p>
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
