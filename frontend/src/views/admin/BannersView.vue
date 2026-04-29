<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { bannersAPI, uploadAPI } from '@/api/index'
import AppModal from '@/components/admin/AppModal.vue'

interface Banner { _id: string; title: string; subtitle: string; image: string; link: string; position: string; status: string; order: number; startsAt: string | null; endsAt: string | null }

const items       = ref<Banner[]>([])
const loading     = ref(true)
const showModal   = ref(false)
const deleteModal = ref(false)
const deleteId    = ref('')
const editing     = ref<Banner | null>(null)
const saving      = ref(false)
const imgLoading  = ref(false)
const form = ref({ title: '', subtitle: '', image: '', link: '', position: 'home_top', status: 'active', order: 0, startsAt: '', endsAt: '' })

const POSITIONS = ['home_top', 'home_middle', 'sidebar', 'popup']

function openAdd()    { editing.value = null; form.value = { title: '', subtitle: '', image: '', link: '', position: 'home_top', status: 'active', order: 0, startsAt: '', endsAt: '' }; showModal.value = true }
function openEdit(b: Banner) {
  editing.value = b
  form.value = { title: b.title, subtitle: b.subtitle, image: b.image, link: b.link, position: b.position, status: b.status, order: b.order, startsAt: b.startsAt?.slice(0, 10) ?? '', endsAt: b.endsAt?.slice(0, 10) ?? '' }
  showModal.value = true
}
function askDelete(id: string) { deleteId.value = id; deleteModal.value = true }

async function pickImage() {
  const input = document.createElement('input')
  input.type  = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    imgLoading.value = true
    try {
      const res = await uploadAPI.uploadImage(file)
      form.value.image = res.data.url
    } finally { imgLoading.value = false }
  }
  input.click()
}

async function save() {
  saving.value = true
  try {
    const payload = { ...form.value, startsAt: form.value.startsAt || null, endsAt: form.value.endsAt || null }
    if (editing.value) await bannersAPI.update(editing.value._id, payload)
    else               await bannersAPI.create(payload)
    await fetch_all()
    showModal.value = false
  } finally { saving.value = false }
}

async function confirmDelete() {
  await bannersAPI.remove(deleteId.value)
  deleteModal.value = false
  await fetch_all()
}

async function fetch_all() {
  const res = await bannersAPI.getAll()
  items.value = res.data.data?.banners ?? res.data.data ?? []
}

onMounted(async () => { try { await fetch_all() } finally { loading.value = false } })
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-lg font-semibold text-gray-700">Banners</h2>
      <button @click="openAdd" class="px-4 py-2 rounded-lg text-sm font-semibold" style="background:#ffde59;color:#545454">+ Add Banner</button>
    </div>

    <div v-if="loading" class="text-gray-400 py-10 text-center">Loading...</div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table class="w-full min-w-max text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
            <th class="px-4 py-3">Image</th>
            <th class="px-4 py-3">Title</th>
            <th class="px-4 py-3">Position</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-gray-400">No banners yet.</td>
          </tr>
          <tr v-for="b in items" :key="b._id" class="border-b border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-2">
              <img v-if="b.image" :src="b.image" class="w-20 h-12 object-cover rounded" />
              <div v-else class="w-20 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-300">No img</div>
            </td>
            <td class="px-4 py-3">
              <p class="font-medium text-gray-800">{{ b.title }}</p>
              <p class="text-xs text-gray-400">{{ b.subtitle }}</p>
            </td>
            <td class="px-4 py-3 text-gray-400 capitalize text-xs">{{ b.position.replace('_', ' ') }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-xs" :class="b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">{{ b.status }}</span>
            </td>
            <td class="px-4 py-3 text-right space-x-2">
              <button @click="openEdit(b)" class="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">Edit</button>
              <button @click="askDelete(b._id)" class="text-xs px-3 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form Modal -->
    <AppModal v-if="showModal" :title="editing ? 'Edit Banner' : 'Add Banner'" @close="showModal = false">
      <form @submit.prevent="save" class="p-4 space-y-4">
        <!-- Image uploader -->
        <div>
          <label class="label">Image</label>
          <div class="flex items-center gap-3">
            <div class="h-20 w-32 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer" @click="pickImage">
              <img v-if="form.image" :src="form.image" class="w-full h-full object-cover" />
              <span v-else-if="imgLoading" class="text-xs text-gray-400">Uploading...</span>
              <span v-else class="text-xs text-gray-400">Click</span>
            </div>
            <input v-model="form.image" class="input flex-1" placeholder="or paste URL" type="url" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="label">Title *</label>
            <input v-model="form.title" required class="input" />
          </div>
          <div class="col-span-2">
            <label class="label">Subtitle</label>
            <input v-model="form.subtitle" class="input" />
          </div>
          <div>
            <label class="label">Link</label>
            <input v-model="form.link" class="input" placeholder="https://..." />
          </div>
          <div>
            <label class="label">Position</label>
            <select v-model="form.position" class="input">
              <option v-for="p in POSITIONS" :key="p" :value="p" class="capitalize">{{ p.replace('_', ' ') }}</option>
            </select>
          </div>
          <div>
            <label class="label">Status</label>
            <select v-model="form.status" class="input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label class="label">Order</label>
            <input v-model.number="form.order" type="number" class="input" />
          </div>
          <div>
            <label class="label">Starts At</label>
            <input v-model="form.startsAt" type="date" class="input" />
          </div>
          <div>
            <label class="label">Ends At</label>
            <input v-model="form.endsAt" type="date" class="input" />
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <button type="button" @click="showModal = false" class="px-4 py-1.5 text-sm border border-gray-200 rounded-lg">Cancel</button>
          <button type="submit" :disabled="saving" class="px-4 py-1.5 text-sm rounded-lg font-semibold" style="background:#ffde59;color:#545454">{{ saving ? 'Saving...' : 'Save' }}</button>
        </div>
      </form>
    </AppModal>

    <!-- Delete Modal -->
    <AppModal v-if="deleteModal" title="Delete Banner" @close="deleteModal = false">
      <p class="text-sm text-gray-600 p-4">Delete this banner? This cannot be undone.</p>
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
 