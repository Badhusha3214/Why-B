<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { publicAPI } from '@/api/index'
import { cart } from '@/stores/cart'

const router = useRouter()
const route  = useRoute()

const products   = ref<any[]>([])
const categories = ref<any[]>([])
const loading    = ref(true)
const total      = ref(0)

const search   = ref(String(route.query.search ?? ''))
const category = ref(String(route.query.category ?? ''))
const sort     = ref(String(route.query.sort ?? 'newest'))
const page     = ref(Number(route.query.page ?? 1))
const PER_PAGE = 12

async function fetchProducts() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      status: 'active', limit: PER_PAGE, page: page.value,
    }
    if (search.value)   params.search   = search.value
    if (category.value) params.category = category.value
    if (sort.value === 'price_asc')  params.sortBy = 'price'; params.sortOrder = 'asc'
    if (sort.value === 'price_desc') { params.sortBy = 'price'; params.sortOrder = 'desc' }
    if (sort.value === 'newest')     { params.sortBy = 'createdAt'; params.sortOrder = 'desc' }
    const res = await publicAPI.getProducts(params)
    products.value = res.data.data?.products ?? res.data.data ?? []
    total.value    = res.data.total ?? products.value.length
  } catch { products.value = [] } finally { loading.value = false }
}

const totalPages = computed(() => Math.ceil(total.value / PER_PAGE))

watch([search, category, sort], () => { page.value = 1; fetchProducts() })
watch(page, fetchProducts)

onMounted(async () => {
  const cRes = await publicAPI.getCategories()
  categories.value = cRes.data.data?.categories ?? cRes.data.data ?? []
  fetchProducts()
})

function addToCart(p: any) {
  cart.add({ productId: p._id, name: p.name, price: p.price, salePrice: p.salePrice, image: p.images?.[0] ?? '', quantity: 1 })
}
</script>

<template>
  <div class="shop-page">
    <div class="shop-inner">

      <!-- Page header -->
      <div class="page-head">
        <h1 class="page-title">All Kits</h1>
        <p class="page-sub">{{ total }} project kits available</p>
      </div>

      <!-- Filters bar -->
      <div class="filters-bar">
        <!-- Search -->
        <div class="search-wrap">
          <svg class="s-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" class="search-inp" placeholder="Search kits..." />
        </div>
        <!-- Category -->
        <select v-model="category" class="filter-sel">
          <option value="">All Categories</option>
          <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
        </select>
        <!-- Sort -->
        <select v-model="sort" class="filter-sel">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid">
        <div v-for="i in 8" :key="i" class="skeleton"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="products.length === 0" class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" width="48" height="48" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <p>No kits found. Try adjusting your filters.</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid">
        <div v-for="p in products" :key="p._id" class="p-card">
          <div class="p-img-wrap" @click="router.push(`/shop/${p._id}`)">
            <img v-if="p.images?.[0]" :src="p.images[0]" class="p-img" :alt="p.name" />
            <div v-else class="p-img-blank"><svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1" width="40" height="40" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
            <span v-if="p.salePrice" class="sale-chip">SALE</span>
            <span v-if="p.isFeatured" class="feat-chip">FEATURED</span>
          </div>
          <div class="p-body">
            <p class="p-name" @click="router.push(`/shop/${p._id}`)">{{ p.name }}</p>
            <p class="p-desc">{{ p.shortDescription || p.description?.slice(0, 70) }}</p>
            <div class="p-foot">
              <div>
                <span class="p-price">Rs {{ (p.salePrice ?? p.price).toLocaleString() }}</span>
                <span v-if="p.salePrice" class="p-old">Rs {{ p.price.toLocaleString() }}</span>
              </div>
              <div class="p-actions">
                <button class="btn-view" @click="router.push(`/shop/${p._id}`)">Details</button>
                <button class="btn-cart" @click="addToCart(p)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button :disabled="page <= 1" @click="page--" class="pag-btn">← Prev</button>
        <span class="pag-info">Page {{ page }} of {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="page++" class="pag-btn">Next →</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.shop-page  { padding: 40px 20px 80px; min-height: 60vh; background: #fff; }
.shop-inner { max-width: 1200px; margin: 0 auto; }
.page-head  { margin-bottom: 28px; }
.page-title { font-size: 28px; font-weight: 800; color: #545454; }
.page-sub   { font-size: 14px; color: #94a3b8; margin-top: 4px; }
.filters-bar { display: flex; gap: 12px; margin-bottom: 28px; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; min-width: 180px; }
.s-ic        { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
.search-inp  { width: 100%; padding: 10px 12px 10px 36px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; outline: none; transition: border-color .15s; background: #fff; }
.search-inp:focus { border-color: #ffde59; }
.filter-sel  { padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; color: #545454; outline: none; background: #fff; cursor: pointer; }
.filter-sel:focus { border-color: #ffde59; }
.grid        { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; margin-bottom: 36px; }
.skeleton    { height: 320px; background: #f1f5f9; border-radius: 16px; animation: pulse 1.4s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.5} }
.empty  { text-align: center; padding: 80px 20px; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 14px; }
.p-card { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.06); transition: transform .15s, box-shadow .15s; }
.p-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,.1); }
.p-img-wrap  { height: 200px; overflow: hidden; cursor: pointer; background: #f8fafc; position: relative; }
.p-img       { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.p-card:hover .p-img { transform: scale(1.05); }
.p-img-blank { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.sale-chip   { position: absolute; top: 10px; left: 10px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; }
.feat-chip   { position: absolute; top: 10px; right: 10px; background: #ffde59; color: #545454; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; }
.p-body  { padding: 16px; }
.p-name  { font-size: 15px; font-weight: 700; color: #545454; margin-bottom: 5px; cursor: pointer; transition: color .12s; line-height: 1.3; }
.p-name:hover { color: #3b82f6; }
.p-desc  { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 36px; }
.p-foot  { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.p-price { font-size: 16px; font-weight: 800; color: #545454; }
.p-old   { font-size: 11px; color: #94a3b8; text-decoration: line-through; margin-left: 5px; }
.p-actions { display: flex; gap: 6px; }
.btn-view { padding: 7px 12px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: transparent; font-size: 12px; font-weight: 600; color: #545454; cursor: pointer; transition: all .12s; }
.btn-view:hover { border-color: #545454; }
.btn-cart { width: 34px; height: 34px; border-radius: 8px; border: none; background: #545454; color: #ffde59; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: opacity .15s; }
.btn-cart:hover { opacity: .85; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; }
.pag-btn  { padding: 9px 20px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 13px; font-weight: 600; color: #545454; cursor: pointer; transition: all .12s; }
.pag-btn:hover:not(:disabled) { background: #545454; color: #ffde59; border-color: #545454; }
.pag-btn:disabled { opacity: .4; cursor: not-allowed; }
.pag-info { font-size: 13px; color: #94a3b8; }
</style>
