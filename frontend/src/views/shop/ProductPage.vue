<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { publicAPI } from '@/api/index'
import { cart } from '@/stores/cart'
import { shopAuth } from '@/stores/shopAuth'

const route  = useRoute()
const router = useRouter()

const product  = ref<any>(null)
const loading  = ref(true)
const qty      = ref(1)
const mainImg  = ref(0)
const added    = ref(false)
const reviews  = ref<any[]>([])

onMounted(async () => {
  try {
    const id = route.params.id as string
    const [pRes, rRes] = await Promise.all([
      publicAPI.getProduct(id),
      publicAPI.getReviews({ product: id, status: 'approved' }),
    ])
    product.value = pRes.data.data
    reviews.value = rRes.data.data?.reviews ?? rRes.data.data ?? []
  } catch { router.push('/shop') } finally { loading.value = false }
})

const effectivePrice = computed(() => product.value?.salePrice ?? product.value?.price ?? 0)
const savings = computed(() => product.value?.salePrice ? product.value.price - product.value.salePrice : 0)

function addToCart() {
  if (!product.value) return
  cart.add({
    productId: product.value._id,
    name:      product.value.name,
    price:     product.value.price,
    salePrice: product.value.salePrice,
    image:     product.value.images?.[0] ?? '',
    quantity:  qty.value,
  })
  added.value = true
  setTimeout(() => added.value = false, 2000)
}

function buyNow() {
  addToCart()
  router.push('/cart')
}

function stars(n: number) {
  return Array(5).fill(0).map((_, i) => i < n ? '#ffde59' : '#e2e8f0')
}
const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  return (reviews.value.reduce((s, r) => s + r.rating, 0) / reviews.value.length).toFixed(1)
})
</script>

<template>
  <div class="product-page">

    <!-- Loading -->
    <div v-if="loading" class="page-inner">
      <div class="skeleton-layout">
        <div class="sk-img"></div>
        <div class="sk-content"><div class="sk-line lg"></div><div class="sk-line md"></div><div class="sk-line sm"></div></div>
      </div>
    </div>

    <div v-else-if="product" class="page-inner">

      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/shop" class="bc-link">Shop</router-link>
        <span class="bc-sep">›</span>
        <span class="bc-cur">{{ product.name }}</span>
      </div>

      <!-- Product layout -->
      <div class="product-layout">

        <!-- Gallery -->
        <div class="gallery">
          <div class="gallery-main-wrap">
            <img v-if="product.images?.[mainImg]" :src="product.images[mainImg]" class="gallery-main" :alt="product.name" />
            <div v-else class="gallery-main-blank">
              <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1" width="64" height="64" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
          </div>
          <div v-if="product.images?.length > 1" class="gallery-thumbs">
            <img
              v-for="(img, i) in product.images" :key="i"
              :src="img" class="gallery-thumb"
              :class="{ 'gallery-thumb--active': mainImg === i }"
              @click="mainImg = i"
            />
          </div>
        </div>

        <!-- Info -->
        <div class="product-info">
          <div class="badges-row">
            <span v-if="product.isFeatured" class="badge-feat">Featured</span>
            <span class="badge-status" :class="product.status">{{ product.status }}</span>
          </div>
          <h1 class="p-title">{{ product.name }}</h1>

          <!-- Rating -->
          <div v-if="reviews.length" class="rating-row">
            <span v-for="(c, i) in stars(Math.round(Number(avgRating)))" :key="i" class="star" :style="{ color: c }">★</span>
            <span class="rating-val">{{ avgRating }}</span>
            <span class="rating-count">({{ reviews.length }} reviews)</span>
          </div>

          <!-- Price -->
          <div class="price-block">
            <span class="price-main">Rs {{ effectivePrice.toLocaleString() }}</span>
            <span v-if="product.salePrice" class="price-old">Rs {{ product.price.toLocaleString() }}</span>
            <span v-if="savings > 0" class="price-save">Save Rs {{ savings.toLocaleString() }}</span>
          </div>

          <!-- Short desc -->
          <p v-if="product.shortDescription" class="short-desc">{{ product.shortDescription }}</p>

          <!-- Components list -->
          <div v-if="product.components?.length" class="comp-box">
            <p class="comp-box-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" style="display:inline;vertical-align:-2px;margin-right:5px"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              What's in this kit ({{ product.components.length }} components)
            </p>
            <div class="comp-list">
              <div v-for="c in product.components" :key="c._id ?? c" class="comp-item">
                <span class="comp-dot"></span>
                <span>{{ c.name ?? 'Component' }}</span>
                <span v-if="c.price" class="comp-price">Rs {{ c.price.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Quantity + actions -->
          <div class="qty-row">
            <button class="qty-btn" @click="qty = Math.max(1, qty - 1)">−</button>
            <span class="qty-val">{{ qty }}</span>
            <button class="qty-btn" @click="qty++">+</button>
          </div>

          <div class="action-btns">
            <button class="btn-buy" @click="buyNow">Buy Now</button>
            <button class="btn-cart" :class="{ 'btn-cart--added': added }" @click="addToCart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              {{ added ? '✓ Added!' : 'Add to Cart' }}
            </button>
          </div>

          <!-- Trust badges -->
          <div class="trust-row">
            <div class="trust-item"><span>📦</span> All components included</div>
            <div class="trust-item"><span>🚚</span> Fast shipping</div>
            <div class="trust-item"><span>🔄</span> Easy returns</div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="product.description" class="desc-section">
        <h2 class="section-h">Description</h2>
        <div class="desc-body">{{ product.description }}</div>
      </div>

      <!-- Reviews -->
      <div class="reviews-section">
        <div class="reviews-head">
          <h2 class="section-h">Reviews</h2>
          <router-link v-if="shopAuth.isLoggedIn" :to="`/account?tab=review&product=${product._id}`" class="write-review-btn">Write a Review</router-link>
          <router-link v-else to="/login" class="write-review-btn">Sign in to review</router-link>
        </div>
        <div v-if="reviews.length === 0" class="no-reviews">No reviews yet. Be the first to review this kit!</div>
        <div v-else class="reviews-list">
          <div v-for="r in reviews" :key="r._id" class="review-card">
            <div class="review-top">
              <div class="reviewer-avatar">{{ (r.customer?.name ?? 'U').charAt(0).toUpperCase() }}</div>
              <div>
                <p class="reviewer-name">{{ r.customer?.name ?? 'Customer' }}</p>
                <div class="review-stars">
                  <span v-for="(c, i) in stars(r.rating)" :key="i" class="star-sm" :style="{ color: c }">★</span>
                </div>
              </div>
              <span class="review-date">{{ new Date(r.createdAt).toLocaleDateString() }}</span>
            </div>
            <p v-if="r.title" class="review-title">{{ r.title }}</p>
            <p class="review-body">{{ r.body }}</p>
            <div v-if="r.adminReply" class="admin-reply">
              <strong>Fris-b Reply:</strong> {{ r.adminReply }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-page { background: #fff; min-height: 60vh; }
.page-inner   { max-width: 1200px; margin: 0 auto; padding: 32px 24px 80px; }
/* Skeleton */
.skeleton-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.sk-img  { height: 400px; background: #f1f5f9; border-radius: 16px; animation: pulse 1.4s ease-in-out infinite; }
.sk-content { display: flex; flex-direction: column; gap: 16px; padding-top: 20px; }
.sk-line { height: 20px; background: #f1f5f9; border-radius: 8px; animation: pulse 1.4s ease-in-out infinite; }
.sk-line.lg { width: 80%; height: 32px; }
.sk-line.md { width: 50%; }
.sk-line.sm { width: 30%; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.5} }

/* Breadcrumb */
.breadcrumb { display: flex; align-items: center; gap: 6px; margin-bottom: 28px; font-size: 13px; }
.bc-link { color: #94a3b8; text-decoration: none; }
.bc-link:hover { color: #545454; }
.bc-sep  { color: #cbd5e1; }
.bc-cur  { color: #545454; font-weight: 600; }

/* Layout */
.product-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 48px; align-items: start; }

/* Gallery */
.gallery-main-wrap { border-radius: 18px; overflow: hidden; background: #f8fafc; margin-bottom: 12px; }
.gallery-main { width: 100%; max-height: 420px; object-fit: cover; display: block; }
.gallery-main-blank { height: 320px; display: flex; align-items: center; justify-content: center; }
.gallery-thumbs { display: flex; gap: 8px; flex-wrap: wrap; }
.gallery-thumb { width: 68px; height: 68px; object-fit: cover; border-radius: 10px; cursor: pointer; border: 2px solid transparent; opacity: .7; transition: all .15s; }
.gallery-thumb:hover { opacity: 1; }
.gallery-thumb--active { border-color: #ffde59; opacity: 1; }

/* Info */
.badges-row  { display: flex; gap: 8px; margin-bottom: 12px; }
.badge-feat  { background: #ffde59; color: #545454; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; }
.badge-status { font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; }
.badge-status.active { background: #dcfce7; color: #166534; }
.badge-status.draft  { background: #fef9c3; color: #854d0e; }
.p-title  { font-size: 28px; font-weight: 900; color: #545454; line-height: 1.2; margin-bottom: 12px; }
.rating-row { display: flex; align-items: center; gap: 4px; margin-bottom: 16px; }
.star { font-size: 16px; }
.rating-val   { font-size: 14px; font-weight: 700; color: #545454; margin-left: 4px; }
.rating-count { font-size: 13px; color: #94a3b8; }
.price-block  { display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.price-main   { font-size: 32px; font-weight: 900; color: #545454; }
.price-old    { font-size: 18px; color: #94a3b8; text-decoration: line-through; }
.price-save   { font-size: 13px; font-weight: 700; color: #059669; background: #dcfce7; padding: 3px 10px; border-radius: 20px; }
.short-desc   { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 20px; }

/* Components box */
.comp-box { background: #fafafa; border: 1.5px solid #f1f5f9; border-radius: 14px; padding: 16px; margin-bottom: 20px; }
.comp-box-title { font-size: 12px; font-weight: 700; color: #545454; margin-bottom: 12px; text-transform: uppercase; letter-spacing: .04em; }
.comp-list { display: flex; flex-direction: column; gap: 6px; }
.comp-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569; }
.comp-dot  { width: 6px; height: 6px; border-radius: 50%; background: #ffde59; flex-shrink: 0; }
.comp-price { margin-left: auto; font-size: 12px; color: #94a3b8; }

/* Qty */
.qty-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.qty-btn  { width: 36px; height: 36px; border-radius: 9px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 18px; color: #545454; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .12s; }
.qty-btn:hover { background: #f8f9fa; border-color: #545454; }
.qty-val  { font-size: 16px; font-weight: 700; color: #545454; min-width: 32px; text-align: center; }

/* Actions */
.action-btns { display: flex; gap: 10px; margin-bottom: 20px; }
.btn-buy  { flex: 1; padding: 14px; border-radius: 12px; border: none; background: #ffde59; color: #545454; font-size: 15px; font-weight: 800; cursor: pointer; transition: transform .15s, box-shadow .15s; box-shadow: 0 4px 16px rgba(255,222,89,.35); }
.btn-buy:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,222,89,.5); }
.btn-cart { flex: 1; padding: 14px; border-radius: 12px; border: 2px solid #545454; background: transparent; color: #545454; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .15s; }
.btn-cart:hover { background: #545454; color: #fff; }
.btn-cart--added { background: #545454; color: #ffde59; border-color: #545454; }

/* Trust */
.trust-row  { display: flex; gap: 16px; flex-wrap: wrap; }
.trust-item { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 5px; }

/* Description */
.desc-section { border-top: 1px solid #f1f5f9; padding-top: 40px; margin-bottom: 40px; }
.section-h    { font-size: 20px; font-weight: 800; color: #545454; margin-bottom: 16px; }
.desc-body    { font-size: 15px; color: #475569; line-height: 1.8; white-space: pre-wrap; }

/* Reviews */
.reviews-section { border-top: 1px solid #f1f5f9; padding-top: 40px; }
.reviews-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.write-review-btn { padding: 9px 18px; border-radius: 10px; background: #545454; color: #ffde59; font-size: 13px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; }
.no-reviews { text-align: center; color: #94a3b8; padding: 32px; }
.reviews-list { display: flex; flex-direction: column; gap: 16px; }
.review-card  { background: #fafafa; border-radius: 14px; padding: 20px; border: 1px solid #f1f5f9; }
.review-top   { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.reviewer-avatar { width: 38px; height: 38px; border-radius: 50%; background: #545454; color: #ffde59; font-size: 15px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.reviewer-name { font-size: 13px; font-weight: 700; color: #545454; margin-bottom: 3px; }
.review-stars  { display: flex; gap: 2px; }
.star-sm       { font-size: 13px; }
.review-date   { margin-left: auto; font-size: 11px; color: #94a3b8; flex-shrink: 0; }
.review-title  { font-size: 14px; font-weight: 700; color: #545454; margin-bottom: 6px; }
.review-body   { font-size: 13px; color: #475569; line-height: 1.6; }
.admin-reply   { margin-top: 12px; padding: 10px 14px; background: #fffbeb; border-left: 3px solid #ffde59; border-radius: 0 8px 8px 0; font-size: 12px; color: #545454; }

@media (max-width: 768px) {
  .product-layout { grid-template-columns: 1fr; gap: 24px; }
  .skeleton-layout { grid-template-columns: 1fr; }
  .p-title { font-size: 22px; }
}
</style>
