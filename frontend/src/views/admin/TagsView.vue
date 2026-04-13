<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { tagsAPI } from '@/api/index'
import AppModal from '@/components/admin/AppModal.vue'

interface Tag { _id: string; name: string; description: string; color: string }

const items       = ref<Tag[]>([])
const loading     = ref(true)
const showModal   = ref(false)
const deleteModal = ref(false)
const deleteId    = ref('')
const editing     = ref<Tag | null>(null)
const saving      = ref(false)
const form        = ref({ name: '', description: '', color: '#ffde59' })

function openAdd()    { editing.value = null; form.value = { name: '', description: '', color: '#ffde59' }; showModal.value = true }
function openEdit(t: Tag) { editing.value = t; form.value = { name: t.name, description: t.description, color: t.color }; showModal.value = true }
function askDelete(id: string) { deleteId.value = id; deleteModal.value = true }

async function save() {
  saving.value = true
  try {
    if (editing.value) await tagsAPI.update(editing.value._id, form.value)
    else               await tagsAPI.create(form.value)
    await fetch_all()
    showModal.value = false
  } finally { saving.value = false }
}

async function confirmDelete() {
  await tagsAPI.remove(deleteId.value)
  deleteModal.value = false
  await fetch_all()
}

async function fetch_all() {
  const res = await tagsAPI.getAll()
  items.value = res.data.data?.tags ?? res.data.data ?? []
}

onMounted(async () => { try { await fetch_all() } finally { loading.value = false } })
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-lg font-semibold text-gray-700">Tags</h2>
      <button @click="openAdd" class="px-4 py-2 rounded-lg text-sm font-semibold" style="background:#ffde59;color:#545454">+ Add Tag</button>
    </div>

    <div v-if="loading" class="text-gray-400 py-10 text-center">Loading...</div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Color</th>
            <th class="px-4 py-3">Description</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-gray-400">No tags yet.</td>
          </tr>
          <tr v-for="t in items" :key="t._id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 font-medium">
              <span class="inline-flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full inline-block" :style="'background:' + t.color" />
                {{ t.name }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-400 font-mono text-xs">{{ t.color }}</td>
            <td class="px-4 py-3 text-gray-400">{{ t.description || '-' }}</td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="openEdit(t)" class="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">Edit</button>
              <button @click="askDelete(t._id)" class="text-xs px-3 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form Modal -->
    <AppModal v-if="showModal" :title="editing ? 'Edit Tag' : 'Add Tag'" @close="showModal = false">
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
          <label class="label">Color</label>
          <div class="flex items-center gap-2">
            <input v-model="form.color" type="color" class="w-10 h-10 rounded cursor-pointer border border-gray-200" />
            <input v-model="form.color" class="input" placeholder="#rrggbb" />
          </div>
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
    <AppModal v-if="deleteModal" title="Delete Tag" @close="deleteModal = false">
      <p class="text-sm text-gray-600 p-4">Delete this tag? This cannot be undone.</p>
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
