<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { productsAPI, categoriesAPI, tagsAPI, componentsAPI, uploadAPI } from '@/api/index'

interface Component { _id: string; name: string; type: string; sku: string; price: number; stock: number }
interface Product {
  _id: string; name: string; slug: string; description: string; shortDescription: string
  price: number; salePrice?: number; images: string[]; category?: any; tags?: any[]
  components?: Component[]; stock: number; sku: string; status: string; isFeatured: boolean
}
interface Category { _id: string; name: string }
interface Tag       { _id: string; name: string; color?: string }

const view        = ref<'list' | 'detail' | 'form'>('list')
const products    = ref<Product[]>([])
const categories  = ref<Category[]>([])
const tags        = ref<Tag[]>([])
const allComps    = ref<Component[]>([])
const loading     = ref(true)
const saving      = ref(false)
const deleteModal = ref(false)
const deleteId    = ref('')
const selected    = ref<Product | null>(null)
const search      = ref('')

const IMAGE_SLOTS = 4
const imageUrls   = ref<string[]>(Array(IMAGE_SLOTS).fill(''))
const imgLoading  = ref<boolean[]>(Array(IMAGE_SLOTS).fill(false))

const form = ref({
  name: '', shortDescription: '', description: '',
  price: 0, salePrice: '', sku: '', stock: 0,
  category: '', tags: [] as string[], components: [] as string[],
  status: 'draft', isFeatured: false,
})

// -- computed ----------------------------------------------------------------
const filteredProducts = computed(() => {
  if (!search.value) return products.value
  const q = search.value.toLowerCase()
  return products.value.filter(p =>
    p.name.toLowerCase().includes(q) || (p.shortDescription ?? '').toLowerCase().includes(q)
  )
})

const selectedCompObjects = computed(() =>
  allComps.value.filter(c => form.value.components.includes(c._id))
)

const kitCost = computed(() =>
  selectedCompObjects.value.reduce((s, c) => s + (c.price ?? 0), 0)
)

const detailCompsByType = computed(() => {
  if (!selected.value?.components?.length) return {}
  const groups: Record<string, Component[]> = {}
  for (const c of selected.value.components) {
    const t = c.type || 'other'
    if (!groups[t]) groups[t] = []
    groups[t].push(c)
  }
  return groups
})

const detailKitTotal = computed(() =>
  (selected.value?.components ?? []).reduce((s, c) => s + (c.price ?? 0), 0)
)

// -- helpers ----------------------------------------------------------------
function resetForm(p?: Product) {
  imageUrls.value = Array(IMAGE_SLOTS).fill('')
  form.value = {
    name: p?.name ?? '',
    shortDescription: p?.shortDescription ?? '',
    description:      p?.description ?? '',
    price:            p?.price ?? 0,
    salePrice:        p?.salePrice != null ? String(p.salePrice) : '',
    sku:              p?.sku ?? '',
    stock:            p?.stock ?? 0,
    category:         p?.category?._id ?? p?.category ?? '',
    tags:             p?.tags?.map((t: any) => t._id ?? t) ?? [],
    components:       p?.components?.map((c: any) => c._id ?? c) ?? [],
    status:           p?.status ?? 'draft',
    isFeatured:       p?.isFeatured ?? false,
  }
  if (p?.images) p.images.forEach((url, i) => { if (i < IMAGE_SLOTS) imageUrls.value[i] = url })
}

function openAdd()             { selected.value = null;  resetForm();  view.value = 'form'   }
function openEdit(p: Product)  { selected.value = p;     resetForm(p); view.value = 'form'   }
function openDetail(p: Product){ selected.value = p;                   view.value = 'detail' }
function back()                { view.value = 'list' }

function toggleTag(id: string) {
  const i = form.value.tags.indexOf(id)
  i === -1 ? form.value.tags.push(id) : form.value.tags.splice(i, 1)
}

async function uploadImage(idx: number, file: File) {
  imgLoading.value[idx] = true
  try {
    const res = await uploadAPI.uploadImage(file)
    imageUrls.value[idx] = 'http://localhost:3000' + res.data.url
  } catch { } finally { imgLoading.value[idx] = false }
}

function pickFile(idx: number) {
  const input = document.createElement('input')
  input.type  = 'file'; input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) uploadImage(idx, file)
  }
  input.click()
}

async function save() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      salePrice: form.value.salePrice !== '' ? Number(form.value.salePrice) : undefined,
      images:    imageUrls.value.filter(Boolean),
    }
    if (selected.value) await productsAPI.update(selected.value._id, payload)
    else               await productsAPI.create(payload)
    await fetchProducts()
    view.value = 'list'
  } catch { } finally { saving.value = false }
}

async function confirmDelete() {
  await productsAPI.remove(deleteId.value)
  deleteModal.value = false
  if (selected.value?._id === deleteId.value) { selected.value = null; view.value = 'list' }
  await fetchProducts()
}

function askDelete(id: string) { deleteId.value = id; deleteModal.value = true }

async function fetchProducts() {
  const res = await productsAPI.getAll({ populate: 'category,tags,components' })
  products.value = res.data.data?.products ?? res.data.data ?? []
}

onMounted(async () => {
  try {
    const [pRes, cRes, tRes, compRes] = await Promise.all([
      productsAPI.getAll({ populate: 'category,tags,components' }),
      categoriesAPI.getAll(),
      tagsAPI.getAll(),
      componentsAPI.getAll(),
    ])
    products.value   = pRes.data.data?.products    ?? pRes.data.data  ?? []
    categories.value = cRes.data.data?.categories  ?? cRes.data.data  ?? []
    tags.value       = tRes.data.data?.tags         ?? tRes.data.data  ?? []
    allComps.value   = compRes.data.data?.components ?? compRes.data.data ?? []
  } finally { loading.value = false }
})

const TYPE_COLOR: Record<string, string> = {
  part: '#3b82f6', variant: '#7c3aed', addon: '#f59e0b', bundle: '#059669',
}
</script>

<template>
  <div>

    <!-- --------------------------------------------------- LIST --- -->
    <template v-if="view === 'list'">

      <div class="pg-header">
        <div>
          <h2 class="pg-title">Project Kits</h2>
          <p class="pg-sub">Each project bundles all required components � students buy one item, get everything needed to build.</p>
        </div>
        <button @click="openAdd" class="btn-add">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Kit
        </button>
      </div>

      <!-- Search bar -->
      <div class="search-wrap">
        <svg class="search-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" placeholder="Search kits..." class="search-inp" />
      </div>

      <div v-if="loading" class="empty-msg">Loading kits...</div>
      <div v-else-if="filteredProducts.length === 0" class="empty-msg">
        {{ search ? 'No matching kits.' : 'No project kits yet.' }}
      </div>

      <div v-else class="kits-grid">
        <div v-for="p in filteredProducts" :key="p._id" class="kit-card">

          <!-- Image -->
          <div class="kit-img-wrap" @click="openDetail(p)">
            <img v-if="p.images && p.images[0]" :src="p.images[0]" :alt="p.name" class="kit-img" />
            <div v-else class="kit-img-blank">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <span class="status-chip" :class="'sc--' + p.status">{{ p.status }}</span>
            <span v-if="p.isFeatured" class="feat-chip">? Featured</span>
          </div>

          <!-- Body -->
          <div class="kit-body">
            <h3 class="kit-name" @click="openDetail(p)">{{ p.name }}</h3>
            <p class="kit-desc">{{ p.shortDescription || (p.description ? p.description.slice(0, 100) : '') }}</p>

            <!-- Kit stats: component count + category -->
            <div class="kit-meta-row">
              <div class="kit-comp-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-4 0v2M8 7V5a2 2 0 00-4 0v2"/></svg>
                {{ p.components ? p.components.length : 0 }} components in kit
              </div>
              <span v-if="p.category && p.category.name" class="kit-cat">{{ p.category.name }}</span>
            </div>

            <!-- Pricing -->
            <div class="kit-price-row">
              <span class="kit-price">Rs {{ p.price ? p.price.toLocaleString() : 0 }}</span>
              <span v-if="p.salePrice" class="kit-sale">Rs {{ p.salePrice.toLocaleString() }}</span>
            </div>

            <!-- Actions -->
            <div class="kit-actions">
              <button @click="openDetail(p)" class="btn-view-kit">View Kit Contents</button>
              <button @click="openEdit(p)"   class="btn-edit-sm">Edit</button>
              <button @click="askDelete(p._id)" class="btn-del-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ------------------------------------------------- DETAIL --- -->
    <template v-else-if="view === 'detail' && selected">

      <div class="pg-header">
        <div class="breadcrumb">
          <button @click="back" class="bc-btn">? Project Kits</button>
          <span class="bc-sep">/</span>
          <span class="bc-name">{{ selected.name }}</span>
        </div>
        <div class="detail-header-btns">
          <button @click="openEdit(selected)" class="btn-add">Edit Kit</button>
          <button @click="askDelete(selected._id)" class="btn-del-outline">Delete</button>
        </div>
      </div>

      <div class="detail-layout">

        <!-- Left -->
        <div class="detail-main">

          <!-- Hero: image gallery -->
          <div v-if="selected.images && selected.images.length" class="gallery">
            <img :src="selected.images[0]" class="gallery-main" />
            <div v-if="selected.images.length > 1" class="gallery-thumbs">
              <img v-for="url in selected.images.slice(1)" :key="url" :src="url" class="gallery-thumb" />
            </div>
          </div>
          <div v-else class="gallery-empty">No images uploaded</div>

          <!-- About -->
          <div class="d-card">
            <h3 class="d-card-title">About this Project</h3>
            <p class="d-card-body">{{ selected.description || selected.shortDescription || 'No description provided.' }}</p>
          </div>

          <!-- Kit contents � main highlight -->
          <div class="kit-contents-card">
            <div class="kc-header">
              <div>
                <h3 class="kc-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:-3px;margin-right:6px"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-4 0v2M8 7V5a2 2 0 00-4 0v2"/></svg>
                  What's in this Kit
                </h3>
                <p class="kc-sub">All components included when a student purchases this project</p>
              </div>
              <div class="kc-count-badge">{{ selected.components ? selected.components.length : 0 }} parts</div>
            </div>

            <div v-if="!selected.components || !selected.components.length" class="kc-empty">
              No components linked to this kit yet.
            </div>

            <div v-else>
              <!-- Grouped by type -->
              <div v-for="(comps, type) in detailCompsByType" :key="type" class="kc-group">
                <div class="kc-group-header" :style="{ borderLeftColor: TYPE_COLOR[type] || '#94a3b8' }">
                  <span class="kc-type-label" :style="{ color: TYPE_COLOR[type] || '#94a3b8' }">{{ type }}</span>
                  <span class="kc-type-count">{{ comps.length }}</span>
                </div>
                <div class="kc-comp-row" v-for="c in comps" :key="c._id">
                  <div class="kc-comp-dot" :style="{ background: TYPE_COLOR[c.type] || '#94a3b8' }"></div>
                  <div class="kc-comp-info">
                    <span class="kc-comp-name">{{ c.name }}</span>
                    <span class="kc-comp-sku">{{ c.sku }}</span>
                  </div>
                  <span class="kc-comp-stock">Qty: 1</span>
                  <span class="kc-comp-price">Rs {{ c.price ? c.price.toLocaleString() : 0 }}</span>
                </div>
              </div>

              <!-- Total -->
              <div class="kc-total-row">
                <span>Component Cost Total</span>
                <div class="kc-total-right">
                  <span class="kc-total-price">Rs {{ detailKitTotal.toLocaleString() }}</span>
                  <span v-if="selected.price" class="kc-margin">
                    Margin: Rs {{ (selected.price - detailKitTotal).toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Right sidebar -->
        <div class="detail-side">

          <div class="d-card">
            <h3 class="d-card-title">Kit Details</h3>
            <div class="meta-list">
              <div class="meta-row"><span class="meta-k">Status</span>        <span class="meta-v"><span class="status-chip" :class="'sc--' + selected.status">{{ selected.status }}</span></span></div>
              <div class="meta-row"><span class="meta-k">Price</span>         <span class="meta-v bold-val">Rs {{ selected.price ? selected.price.toLocaleString() : 0 }}</span></div>
              <div class="meta-row" v-if="selected.salePrice"><span class="meta-k">Sale</span><span class="meta-v green-val">Rs {{ selected.salePrice.toLocaleString() }}</span></div>
              <div class="meta-row"><span class="meta-k">SKU</span>           <span class="meta-v mono-val">{{ selected.sku || '�' }}</span></div>
              <div class="meta-row"><span class="meta-k">Stock</span>         <span class="meta-v">{{ selected.stock }} units</span></div>
              <div class="meta-row"><span class="meta-k">Featured</span>     <span class="meta-v">{{ selected.isFeatured ? 'Yes ?' : 'No' }}</span></div>
              <div class="meta-row" v-if="selected.category?.name"><span class="meta-k">Category</span><span class="meta-v">{{ selected.category.name }}</span></div>
              <div class="meta-row"><span class="meta-k">Components</span>   <span class="meta-v bold-val">{{ selected.components ? selected.components.length : 0 }}</span></div>
            </div>
          </div>

          <div v-if="selected.tags && selected.tags.length" class="d-card">
            <h3 class="d-card-title">Tags</h3>
            <div class="tag-cloud">
              <span v-for="t in selected.tags" :key="t._id ?? t" class="tag-chip"
                :style="t.color ? { background: t.color + '22', color: t.color, borderColor: t.color + '44' } : {}">
                {{ t.name ?? t }}
              </span>
            </div>
          </div>

          <!-- Price breakdown visual -->
          <div v-if="selected.components && selected.components.length && selected.price" class="d-card">
            <h3 class="d-card-title">Price Breakdown</h3>
            <div class="price-breakdown">
              <div class="pb-row"><span class="pb-label">Component cost</span><span class="pb-val">Rs {{ detailKitTotal.toLocaleString() }}</span></div>
              <div class="pb-row"><span class="pb-label">Selling price</span> <span class="pb-val bold-val">Rs {{ selected.price.toLocaleString() }}</span></div>
              <div class="pb-divider"></div>
              <div class="pb-row">
                <span class="pb-label">Margin</span>
                <span class="pb-val" :style="{ color: selected.price - detailKitTotal >= 0 ? '#059669' : '#dc2626' }">
                  Rs {{ (selected.price - detailKitTotal).toLocaleString() }}
                </span>
              </div>
              <div class="pb-bar-wrap">
                <div class="pb-bar-cost" :style="{ width: Math.min(100, (detailKitTotal / selected.price) * 100) + '%' }"></div>
              </div>
              <div class="pb-bar-legend">
                <span><span class="pb-dot cost"></span> Component cost</span>
                <span><span class="pb-dot margin"></span> Margin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- --------------------------------------------------- FORM --- -->
    <template v-else-if="view === 'form'">

      <div class="pg-header">
        <div class="breadcrumb">
          <button @click="back" class="bc-btn">? Project Kits</button>
          <span class="bc-sep">/</span>
          <span class="bc-name">{{ selected ? 'Edit: ' + selected.name : 'New Project Kit' }}</span>
        </div>
      </div>

      <form @submit.prevent="save" class="form-layout">

        <!-- Left column -->
        <div class="form-main">

          <!-- Basic Info -->
          <div class="f-section">
            <h3 class="f-section-title">Project Info</h3>
            <div class="fg2">
              <div class="fc2">
                <label class="flabel">Project Name *</label>
                <input v-model="form.name" required class="finput" placeholder="e.g. QuadFlyer Drone Kit" />
              </div>
              <div class="fc2">
                <label class="flabel">Short Description</label>
                <input v-model="form.shortDescription" class="finput" placeholder="One-line summary shown on listings" />
              </div>
              <div class="fc2">
                <label class="flabel">Full Description</label>
                <textarea v-model="form.description" class="finput" rows="4" placeholder="What will students build? What will they learn?"></textarea>
              </div>
            </div>
          </div>

          <!-- Pricing & Stock -->
          <div class="f-section">
            <h3 class="f-section-title">Pricing &amp; Stock</h3>
            <div class="fg4">
              <div>
                <label class="flabel">Price (Rs) *</label>
                <input v-model.number="form.price" type="number" min="0" required class="finput" />
              </div>
              <div>
                <label class="flabel">Sale Price</label>
                <input v-model="form.salePrice" type="number" min="0" class="finput" placeholder="optional" />
              </div>
              <div>
                <label class="flabel">Stock</label>
                <input v-model.number="form.stock" type="number" min="0" class="finput" />
              </div>
              <div>
                <label class="flabel">SKU</label>
                <input v-model="form.sku" class="finput" />
              </div>
            </div>
            <label class="feat-toggle">
              <input type="checkbox" v-model="form.isFeatured" style="accent-color:#ffde59" />
              Mark as Featured Kit
            </label>
            <!-- Component cost hint -->
            <div v-if="kitCost > 0" class="cost-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Selected components cost: <strong>Rs {{ kitCost.toLocaleString() }}</strong>
              <span v-if="form.price > 0" style="margin-left:8px;color:#059669">
                ? Margin: Rs {{ (form.price - kitCost).toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- Component Kit Picker -->
          <div class="f-section">
            <div class="comp-section-head">
              <div>
                <h3 class="f-section-title" style="margin-bottom:2px">Component Kit</h3>
                <p class="comp-hint-text">Select every component included when a student purchases this project.</p>
              </div>
              <div v-if="form.components.length" class="comp-summary-badge">
                {{ form.components.length }} selected � Rs {{ kitCost.toLocaleString() }}
              </div>
            </div>

            <div class="comp-picker-grid">
              <label
                v-for="c in allComps" :key="c._id"
                class="comp-opt"
                :class="{ 'comp-opt--on': form.components.includes(c._id) }"
              >
                <input type="checkbox" :value="c._id" v-model="form.components" class="sr-only" />
                <span class="comp-check-box" :class="{ 'comp-check-box--on': form.components.includes(c._id) }">
                  <svg v-if="form.components.includes(c._id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" width="10" height="10" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span class="comp-opt-info">
                  <span class="comp-opt-name">{{ c.name }}</span>
                  <span class="comp-opt-type" :style="{ color: TYPE_COLOR[c.type] || '#94a3b8' }">{{ c.type }}</span>
                </span>
                <span class="comp-opt-price">Rs {{ c.price ? c.price.toLocaleString() : 0 }}</span>
              </label>
            </div>
          </div>

          <!-- Images -->
          <div class="f-section">
            <h3 class="f-section-title">Project Images</h3>
            <div class="img-grid">
              <div v-for="idx in IMAGE_SLOTS" :key="idx - 1" class="img-slot">
                <div
                  class="img-uploader"
                  :class="{ 'has-img': imageUrls[idx - 1] }"
                  @click="pickFile(idx - 1)"
                >
                  <img v-if="imageUrls[idx - 1]" :src="imageUrls[idx - 1]" class="img-preview" />
                  <div v-else-if="imgLoading[idx - 1]" class="img-loading"><div class="img-spinner"></div></div>
                  <div v-else class="img-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>{{ idx === 1 ? 'Main image' : 'Image ' + idx }}</span>
                  </div>
                </div>
                <input v-model="imageUrls[idx - 1]" type="url" placeholder="or paste URL" class="finput url-inp" />
              </div>
            </div>
          </div>

        </div>

        <!-- Right sidebar column -->
        <div class="form-side">

          <div class="f-section">
            <h3 class="f-section-title">Status</h3>
            <select v-model="form.status" class="finput">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="f-section">
            <h3 class="f-section-title">Category</h3>
            <select v-model="form.category" class="finput">
              <option value="">-- none --</option>
              <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
            </select>
          </div>

          <div v-if="tags.length" class="f-section">
            <h3 class="f-section-title">Tags</h3>
            <div class="tag-picker">
              <button
                v-for="t in tags" :key="t._id" type="button"
                class="tag-opt"
                :class="{ 'tag-opt--on': form.tags.includes(t._id) }"
                :style="form.tags.includes(t._id) && t.color ? { background: t.color + '22', borderColor: t.color, color: t.color } : {}"
                @click="toggleTag(t._id)"
              >
                <span class="tag-dot" :style="{ background: t.color || '#ccc' }"></span>
                {{ t.name }}
              </button>
            </div>
          </div>

          <div class="f-section form-save-box">
            <button type="submit" :disabled="saving" class="btn-save">
              {{ saving ? 'Saving...' : (selected ? 'Update Kit' : 'Create Kit') }}
            </button>
            <button type="button" @click="back" class="btn-cancel">Cancel</button>
          </div>
        </div>

      </form>
    </template>

    <!-- Delete confirmation overlay -->
    <div v-if="deleteModal" class="del-overlay" @click.self="deleteModal = false">
      <div class="del-box">
        <div class="del-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </div>
        <h3 class="del-title">Delete this kit?</h3>
        <p class="del-sub">This action cannot be undone. The project and all its data will be permanently removed.</p>
        <div class="del-btns">
          <button @click="deleteModal = false" class="btn-cancel" style="flex:1">Cancel</button>
          <button @click="confirmDelete" class="btn-delete-confirm" style="flex:1">Yes, Delete</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Page header */
.pg-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:18px; gap:12px; flex-wrap:wrap; }
.pg-title  { font-size:20px; font-weight:800; color:#545454; margin-bottom:3px; }
.pg-sub    { font-size:12px; color:#94a3b8; max-width:480px; line-height:1.5; }

.btn-add { display:flex; align-items:center; gap:6px; padding:9px 16px; border-radius:10px; border:none; cursor:pointer; background:#ffde59; color:#545454; font-size:13px; font-weight:700; box-shadow:0 2px 8px rgba(255,222,89,.4); transition:transform .1s; }
.btn-add:hover { transform:translateY(-1px); }

/* Search */
.search-wrap { position:relative; margin-bottom:18px; max-width:340px; }
.search-ic   { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:#94a3b8; }
.search-inp  { width:100%; padding:9px 12px 9px 34px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:13px; background:#fff; outline:none; transition:border-color .15s; }
.search-inp:focus { border-color:#ffde59; }
.empty-msg { text-align:center; padding:60px; color:#94a3b8; font-size:13px; }

/* Kit card grid */
.kits-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:18px; }

.kit-card { background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.06); border:1px solid #f1f5f9; transition:transform .15s, box-shadow .15s; }
.kit-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,.1); }

.kit-img-wrap { position:relative; height:175px; cursor:pointer; overflow:hidden; background:#f8fafc; }
.kit-img      { width:100%; height:100%; object-fit:cover; transition:transform .3s; }
.kit-card:hover .kit-img { transform:scale(1.04); }
.kit-img-blank { width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#cbd5e1; }

.status-chip  { position:absolute; top:10px; left:10px; padding:3px 8px; border-radius:6px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; }
.sc--active   { background:#dcfce7; color:#166534; }
.sc--draft    { background:#fef9c3; color:#854d0e; }
.sc--inactive { background:#f3f4f6; color:#6b7280; }

.feat-chip { position:absolute; top:10px; right:10px; background:#ffde59; color:#545454; padding:3px 8px; border-radius:6px; font-size:10px; font-weight:700; }

.kit-body  { padding:16px; }
.kit-name  { font-size:15px; font-weight:700; color:#545454; cursor:pointer; margin-bottom:4px; }
.kit-name:hover { color:#3b82f6; }
.kit-desc  { font-size:12px; color:#64748b; line-height:1.5; margin-bottom:10px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

.kit-meta-row   { display:flex; align-items:center; gap:8px; margin-bottom:10px; flex-wrap:wrap; }
.kit-comp-badge { display:flex; align-items:center; gap:4px; background:#545454; color:#ffde59; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; }
.kit-cat        { padding:3px 8px; background:#f5f3ff; color:#7c3aed; border-radius:20px; font-size:11px; font-weight:600; }

.kit-price-row { display:flex; align-items:baseline; gap:8px; margin-bottom:12px; }
.kit-price     { font-size:17px; font-weight:800; color:#545454; }
.kit-sale      { font-size:12px; color:#94a3b8; text-decoration:line-through; }

.kit-actions    { display:flex; gap:6px; }
.btn-view-kit   { flex:1; padding:8px; border-radius:8px; border:none; cursor:pointer; background:#545454; color:#ffde59; font-size:12px; font-weight:700; transition:opacity .15s; }
.btn-view-kit:hover { opacity:.85; }
.btn-edit-sm    { padding:7px 12px; border-radius:8px; border:1.5px solid #e2e8f0; background:transparent; font-size:12px; font-weight:600; color:#64748b; cursor:pointer; }
.btn-edit-sm:hover  { border-color:#545454; color:#545454; }
.btn-del-sm     { padding:7px 10px; border-radius:8px; border:1.5px solid #fee2e2; background:transparent; color:#ef4444; cursor:pointer; display:flex; align-items:center; }
.btn-del-sm:hover { background:#fee2e2; }

/* Breadcrumb */
.breadcrumb  { display:flex; align-items:center; gap:8px; font-size:14px; }
.bc-btn      { background:none; border:none; color:#545454; cursor:pointer; font-size:14px; font-weight:600; padding:0; text-decoration:underline; }
.bc-sep      { color:#94a3b8; }
.bc-name     { font-weight:700; color:#545454; }
.detail-header-btns { display:flex; gap:8px; }
.btn-del-outline { padding:9px 14px; border-radius:10px; border:1.5px solid #fecaca; background:transparent; color:#ef4444; font-size:13px; font-weight:600; cursor:pointer; }
.btn-del-outline:hover { background:#fee2e2; }

/* Detail layout */
.detail-layout { display:grid; grid-template-columns:1fr 280px; gap:20px; align-items:start; }
@media (max-width:900px) { .detail-layout { grid-template-columns:1fr; } }

.d-card      { background:#fff; border-radius:14px; border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,.06); padding:20px; margin-bottom:16px; }
.d-card-title { font-size:13px; font-weight:700; color:#545454; margin-bottom:10px; }
.d-card-body  { font-size:14px; line-height:1.7; color:#475569; }

.gallery        { margin-bottom:16px; }
.gallery-main   { width:100%; height:260px; object-fit:cover; border-radius:12px; }
.gallery-thumbs { display:flex; gap:8px; margin-top:8px; }
.gallery-thumb  { width:72px; height:72px; object-fit:cover; border-radius:8px; opacity:.8; cursor:pointer; }
.gallery-thumb:hover { opacity:1; }
.gallery-empty  { height:160px; background:#f8fafc; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:13px; margin-bottom:16px; }

/* Kit Contents Card */
.kit-contents-card { background:#fff; border-radius:14px; border:2px solid #545454; box-shadow:0 2px 8px rgba(84,84,84,.1); padding:20px; margin-bottom:16px; }
.kc-header    { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; gap:8px; }
.kc-title     { font-size:15px; font-weight:800; color:#545454; margin-bottom:3px; }
.kc-sub       { font-size:11px; color:#94a3b8; }
.kc-count-badge { background:#545454; color:#ffde59; padding:5px 14px; border-radius:20px; font-size:13px; font-weight:700; flex-shrink:0; }
.kc-empty     { color:#94a3b8; font-size:13px; padding:12px 0; }

.kc-group        { margin-bottom:12px; }
.kc-group-header { display:flex; align-items:center; gap:8px; padding-left:10px; border-left:3px solid; margin-bottom:8px; }
.kc-type-label   { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; }
.kc-type-count   { font-size:11px; background:#f3f4f6; color:#6b7280; padding:1px 6px; border-radius:20px; font-weight:600; }

.kc-comp-row  { display:flex; align-items:center; gap:10px; padding:8px 4px; border-bottom:1px solid #fafafa; }
.kc-comp-dot  { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.kc-comp-info { flex:1; }
.kc-comp-name { font-size:13px; font-weight:600; color:#545454; display:block; }
.kc-comp-sku  { font-size:11px; color:#94a3b8; font-family:monospace; }
.kc-comp-stock { font-size:11px; color:#94a3b8; flex-shrink:0; }
.kc-comp-price { font-size:13px; font-weight:700; color:#545454; flex-shrink:0; }

.kc-total-row   { display:flex; justify-content:space-between; align-items:center; padding:12px 4px 4px; border-top:2px solid #e2e8f0; margin-top:4px; font-size:13px; font-weight:700; color:#545454; }
.kc-total-right { text-align:right; }
.kc-total-price { font-size:15px; font-weight:800; color:#545454; display:block; }
.kc-margin      { font-size:11px; color:#059669; }

/* Detail sidebar */
.meta-list { display:flex; flex-direction:column; }
.meta-row  { display:flex; justify-content:space-between; align-items:center; padding:7px 0; border-bottom:1px solid #f8fafc; }
.meta-k    { font-size:12px; color:#94a3b8; }
.meta-v    { font-size:13px; font-weight:600; color:#545454; }
.bold-val  { font-weight:800; }
.green-val { color:#059669; }
.mono-val  { font-family:monospace; }

.tag-cloud { display:flex; flex-wrap:wrap; gap:6px; }
.tag-chip  { padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; background:#f1f5f9; color:#545454; border:1px solid transparent; }

/* Price breakdown */
.price-breakdown { }
.pb-row     { display:flex; justify-content:space-between; padding:5px 0; font-size:13px; }
.pb-label   { color:#94a3b8; }
.pb-val     { font-weight:600; color:#545454; }
.pb-divider { border-top:1px solid #e2e8f0; margin:6px 0; }
.pb-bar-wrap { height:12px; background:#f3f4f6; border-radius:999px; overflow:hidden; margin:10px 0 6px; }
.pb-bar-cost { height:100%; background:#545454; border-radius:999px; transition:width .4s; }
.pb-bar-legend { display:flex; gap:12px; font-size:10px; color:#94a3b8; }
.pb-dot     { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:4px; }
.pb-dot.cost   { background:#545454; }
.pb-dot.margin { background:#e2e8f0; }

/* Form layout */
.form-layout { display:grid; grid-template-columns:1fr 260px; gap:20px; align-items:start; }
@media (max-width:900px) { .form-layout { grid-template-columns:1fr; } }

.f-section       { background:#fff; border-radius:14px; border:1px solid #f1f5f9; box-shadow:0 1px 3px rgba(0,0,0,.06); padding:20px; margin-bottom:14px; }
.f-section-title { font-size:13px; font-weight:700; color:#545454; margin-bottom:14px; }

.fg2  { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.fc2  { grid-column:span 2; }
.fg4  { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
@media (max-width:700px) { .fg4 { grid-template-columns:repeat(2,1fr); } }

.flabel { display:block; font-size:11px; font-weight:700; color:#64748b; margin-bottom:5px; text-transform:uppercase; letter-spacing:.04em; }
.finput { width:100%; padding:9px 11px; border:1.5px solid #e2e8f0; border-radius:9px; font-size:13px; color:#545454; outline:none; background:#fff; transition:border-color .15s; }
.finput:focus { border-color:#ffde59; }
textarea.finput { resize:vertical; }

.feat-toggle { display:flex; align-items:center; gap:8px; margin-top:12px; font-size:13px; color:#64748b; cursor:pointer; }
.cost-hint   { display:flex; align-items:center; gap:6px; margin-top:10px; font-size:12px; color:#64748b; background:#fffbeb; padding:8px 12px; border-radius:8px; border:1px solid #fcd34d; }

/* Component picker */
.comp-section-head   { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; gap:8px; }
.comp-hint-text      { font-size:11px; color:#94a3b8; margin-top:2px; }
.comp-summary-badge  { background:#545454; color:#ffde59; padding:5px 12px; border-radius:8px; font-size:11px; font-weight:700; flex-shrink:0; }
.comp-picker-grid    { display:grid; grid-template-columns:1fr 1fr; gap:8px; max-height:380px; overflow-y:auto; }
@media (max-width:700px) { .comp-picker-grid { grid-template-columns:1fr; } }

.comp-opt { display:flex; align-items:center; gap:8px; padding:9px 10px; border-radius:10px; border:1.5px solid #e2e8f0; cursor:pointer; background:#fff; transition:all .12s; }
.comp-opt:hover, .comp-opt--on { border-color:#ffde59; background:#fffbeb; }
.comp-check-box { width:18px; height:18px; border-radius:5px; border:2px solid #e2e8f0; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .12s; }
.comp-check-box--on { background:#ffde59; border-color:#ffde59; color:#545454; }
.comp-opt-info  { flex:1; min-width:0; }
.comp-opt-name  { font-size:12px; font-weight:600; color:#545454; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.comp-opt-type  { font-size:10px; font-weight:600; text-transform:uppercase; }
.comp-opt-price { font-size:12px; font-weight:700; color:#545454; flex-shrink:0; }

/* Image upload */
.img-grid    { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
@media (max-width:600px) { .img-grid { grid-template-columns:repeat(2,1fr); } }
.img-slot    { display:flex; flex-direction:column; gap:6px; }
.img-uploader { height:100px; border-radius:10px; border:2px dashed #e2e8f0; display:flex; align-items:center; justify-content:center; cursor:pointer; overflow:hidden; background:#f8fafc; transition:border-color .15s; }
.img-uploader:hover { border-color:#ffde59; }
.has-img     { border-style:solid; border-color:#e2e8f0; }
.img-preview  { width:100%; height:100%; object-fit:cover; }
.img-loading  { display:flex; align-items:center; justify-content:center; width:100%; height:100%; }
.img-spinner  { width:20px; height:20px; border:2px solid #e2e8f0; border-top-color:#ffde59; border-radius:50%; animation:spin .6s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.img-placeholder { display:flex; flex-direction:column; align-items:center; gap:4px; color:#94a3b8; font-size:10px; }
.url-inp     { font-size:11px !important; padding:6px 8px !important; }

@media (max-width: 600px) {
  .search-wrap { max-width: 100%; }
  .pg-header { flex-direction: column; align-items: stretch; }
  .btn-add { justify-content: center; }
  .breadcrumb { flex-wrap: wrap; }
  .detail-header-btns { flex-wrap: wrap; }
}

/* Tags */
.tag-picker { display:flex; flex-wrap:wrap; gap:6px; }
.tag-opt    { display:flex; align-items:center; gap:5px; padding:5px 10px; border-radius:20px; font-size:12px; font-weight:600; border:1.5px solid #e2e8f0; cursor:pointer; background:transparent; color:#64748b; transition:all .12s; }
.tag-opt:hover, .tag-opt--on { border-color:#545454; }
.tag-dot    { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

/* Save box */
.form-save-box { display:flex; flex-direction:column; gap:8px; }
.btn-save      { width:100%; padding:11px; border-radius:10px; border:none; cursor:pointer; background:#ffde59; color:#545454; font-size:14px; font-weight:700; transition:opacity .15s; }
.btn-save:hover { opacity:.9; }
.btn-save:disabled { opacity:.5; cursor:not-allowed; }
.btn-cancel    { width:100%; padding:10px; border-radius:10px; border:1.5px solid #e2e8f0; background:transparent; color:#64748b; font-size:13px; font-weight:600; cursor:pointer; }
.btn-cancel:hover { background:#f8fafc; }

/* Delete modal */
.sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); }
.del-overlay  { position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; z-index:100; }
.del-box      { background:#fff; border-radius:18px; padding:32px; max-width:360px; width:90%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,.2); }
.del-icon-wrap { width:56px; height:56px; background:#fee2e2; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:#ef4444; }
.del-title    { font-size:18px; font-weight:800; color:#545454; margin-bottom:8px; }
.del-sub      { font-size:13px; color:#64748b; line-height:1.5; margin-bottom:24px; }
.del-btns     { display:flex; gap:10px; }
.btn-delete-confirm { padding:10px; border-radius:10px; border:none; cursor:pointer; background:#ef4444; color:#fff; font-size:14px; font-weight:700; }
.btn-delete-confirm:hover { background:#dc2626; }
</style>
