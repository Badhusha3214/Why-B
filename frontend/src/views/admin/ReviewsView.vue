<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { reviewsAPI } from '@/api/index'
import AppModal from '@/components/admin/AppModal.vue'

interface Review {
  _id: string; rating: number; title: string; body: string; status: string; adminReply: string
  product?: { name: string }
  customer?: { name: string; email: string }
  createdAt: string
}

const items       = ref<Review[]>([])
const loading     = ref(true)
const replyModal  = ref(false)
const deleteModal = ref(false)
const deleteId    = ref('')
const editing     = ref<Review | null>(null)
const saving      = ref(false)
const form        = ref({ status: 'pending', adminReply: '' })

function openReply(r: Review) { editing.value = r; form.value = { status: r.status, adminReply: r.adminReply ?? '' }; replyModal.value = true }
function askDelete(id: string) { deleteId.value = id; deleteModal.value = true }

async function save() {
  if (!editing.value) return
  saving.value = true
  try {
    await reviewsAPI.updateStatus(editing.value._id, { status: form.value.status, adminReply: form.value.adminReply })
    await fetch_all()
    replyModal.value = false
  } finally { saving.value = false }
}

async function confirmDelete() {
  await reviewsAPI.remove(deleteId.value)
  deleteModal.value = false
  await fetch_all()
}

async function fetch_all() {
  const res = await reviewsAPI.getAll({ populate: 'product,customer' })
  items.value = res.data.data?.reviews ?? res.data.data ?? []
}

onMounted(async () => { try { await fetch_all() } finally { loading.value = false } })

function statusColor(s: string) {
  return { approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-600' }[s] ?? 'bg-yellow-100 text-yellow-700'
}
function stars(n: number) { return Array(5).fill(0).map((_, i) => i < n ? 'text-yellow-400' : 'text-gray-200') }
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-lg font-semibold text-gray-700">Reviews</h2>
    </div>

    <div v-if="loading" class="text-gray-400 py-10 text-center">Loading...</div>

    <div v-else class="space-y-3">
      <div v-if="items.length === 0" class="text-gray-400 py-10 text-center bg-white rounded-xl border border-gray-100">No reviews yet.</div>
      <div v-for="r in items" :key="r._id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span v-for="(cls, i) in stars(r.rating)" :key="i" class="text-sm" :class="cls">&#9733;</span>
              <span class="text-xs text-gray-400 ml-1">{{ new Date(r.createdAt).toLocaleDateString() }}</span>
            </div>
            <p class="font-semibold text-gray-800 text-sm">{{ r.title || '(no title)' }}</p>
            <p class="text-sm text-gray-600 mt-0.5">{{ r.body }}</p>
            <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span>By: <span class="text-gray-600">{{ r.customer?.name ?? '-' }}</span></span>
              <span>Product: <span class="text-gray-600">{{ r.product?.name ?? '-' }}</span></span>
            </div>
            <div v-if="r.adminReply" class="mt-2 p-2 bg-yellow-50 rounded text-xs text-gray-600 border-l-2 border-yellow-400">
              Admin reply: {{ r.adminReply }}
            </div>
          </div>
          <div class="flex flex-col items-end gap-2 flex-shrink-0">
            <span class="px-2 py-0.5 rounded-full text-xs capitalize" :class="statusColor(r.status)">{{ r.status }}</span>
            <div class="flex gap-1">
              <button @click="openReply(r)" class="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">Moderate</button>
              <button @click="askDelete(r._id)" class="text-xs px-3 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Moderate Modal -->
    <AppModal v-if="replyModal" title="Moderate Review" @close="replyModal = false">
      <div class="p-4 space-y-4">
        <div>
          <label class="label">Status</label>
          <select v-model="form.status" class="input">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label class="label">Admin Reply</label>
          <textarea v-model="form.adminReply" class="input" rows="3" placeholder="Optional reply..." />
        </div>
      </div>
      <template #footer>
        <div class="flex gap-2 p-4 justify-end">
          <button @click="replyModal = false" class="px-4 py-1.5 text-sm border border-gray-200 rounded-lg">Cancel</button>
          <button @click="save" :disabled="saving" class="px-4 py-1.5 text-sm rounded-lg font-semibold" style="background:#ffde59;color:#545454">{{ saving ? 'Saving...' : 'Save' }}</button>
        </div>
      </template>
    </AppModal>

    <!-- Delete Modal -->
    <AppModal v-if="deleteModal" title="Delete Review" @close="deleteModal = false">
      <p class="text-sm text-gray-600 p-4">Delete this review? This cannot be undone.</p>
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
