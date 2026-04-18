<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { cart } from '@/stores/cart'

const router = useRouter()
</script>

<template>
  <div class="cart-page">
    <div class="cart-inner">

      <div class="cart-header">
        <h1 class="cart-title">Shopping Cart</h1>
        <span class="cart-count">{{ cart.itemCount.value }} item{{ cart.itemCount.value !== 1 ? 's' : '' }}</span>
      </div>

      <!-- Empty -->
      <div v-if="cart.items.length === 0" class="empty-cart">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1" width="72" height="72" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        </div>
        <h2 class="empty-title">Your cart is empty</h2>
        <p class="empty-sub">Looks like you haven't added any kits yet.</p>
        <router-link to="/shop" class="btn-shop">Browse Kits</router-link>
      </div>

      <!-- Cart content -->
      <div v-else class="cart-layout">
        <!-- Items -->
        <div class="cart-items">
          <div v-for="item in cart.items" :key="item.productId" class="cart-item">
            <div class="ci-img-wrap">
              <img v-if="item.image" :src="item.image" class="ci-img" :alt="item.name" />
              <div v-else class="ci-img-blank">
                <svg viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1" width="28" height="28" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            </div>
            <div class="ci-info">
              <p class="ci-name" @click="router.push(`/shop/${item.productId}`)">{{ item.name }}</p>
              <div class="ci-price-row">
                <span class="ci-price">Rs {{ (item.salePrice ?? item.price).toLocaleString() }}</span>
                <span v-if="item.salePrice" class="ci-old">Rs {{ item.price.toLocaleString() }}</span>
              </div>
            </div>
            <div class="ci-qty-wrap">
              <button class="qty-btn" @click="cart.setQty(item.productId, Math.max(1, item.quantity - 1))">−</button>
              <span class="qty-val">{{ item.quantity }}</span>
              <button class="qty-btn" @click="cart.setQty(item.productId, item.quantity + 1)">+</button>
            </div>
            <div class="ci-subtotal">
              Rs {{ ((item.salePrice ?? item.price) * item.quantity).toLocaleString() }}
            </div>
            <button class="ci-remove" @click="cart.remove(item.productId)" title="Remove">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </div>
        </div>

        <!-- Summary -->
        <div class="cart-summary">
          <div class="summary-card">
            <h2 class="summary-title">Order Summary</h2>
            <div class="summary-row">
              <span>Subtotal ({{ cart.itemCount.value }} items)</span>
              <span class="summary-val">Rs {{ cart.subtotal.value.toLocaleString() }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span class="summary-free">Calculated at checkout</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row total-row">
              <span>Subtotal</span>
              <span class="total-val">Rs {{ cart.subtotal.value.toLocaleString() }}</span>
            </div>
            <button class="btn-checkout" @click="router.push('/checkout')">
              Proceed to Checkout →
            </button>
            <router-link to="/shop" class="continue-link">← Continue Shopping</router-link>
          </div>

          <!-- Trust -->
          <div class="trust-badges">
            <div class="trust-row">
              <span class="trust-ic">🔒</span>
              <div><p class="trust-t">Secure Checkout</p><p class="trust-s">256-bit SSL encryption</p></div>
            </div>
            <div class="trust-row">
              <span class="trust-ic">📦</span>
              <div><p class="trust-t">All Kits Complete</p><p class="trust-s">Every part included</p></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.cart-page  { background: #fafafa; min-height: calc(100vh - 64px); padding: 40px 0 80px; }
.cart-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.cart-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 28px; }
.cart-title  { font-size: 26px; font-weight: 800; color: #545454; }
.cart-count  { font-size: 14px; color: #94a3b8; background: #f1f5f9; padding: 3px 10px; border-radius: 20px; }

/* Empty */
.empty-cart  { text-align: center; padding: 80px 20px; display: flex; flex-direction: column; align-items: center; }
.empty-icon  { margin-bottom: 24px; }
.empty-title { font-size: 22px; font-weight: 800; color: #545454; margin-bottom: 8px; }
.empty-sub   { font-size: 14px; color: #94a3b8; margin-bottom: 24px; }
.btn-shop    { display: inline-flex; padding: 12px 24px; border-radius: 12px; background: #545454; color: #ffde59; font-size: 14px; font-weight: 700; text-decoration: none; }

/* Layout */
.cart-layout  { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
.cart-items   { display: flex; flex-direction: column; gap: 12px; }

/* Item */
.cart-item { background: #fff; border-radius: 14px; border: 1px solid #f1f5f9; padding: 16px; display: flex; align-items: center; gap: 14px; }
.ci-img-wrap { width: 72px; height: 72px; border-radius: 10px; overflow: hidden; flex-shrink: 0; background: #f8fafc; }
.ci-img      { width: 100%; height: 100%; object-fit: cover; }
.ci-img-blank { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.ci-info     { flex: 1; min-width: 0; }
.ci-name     { font-size: 14px; font-weight: 700; color: #545454; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px; }
.ci-name:hover { text-decoration: underline; }
.ci-price-row { display: flex; align-items: baseline; gap: 6px; }
.ci-price    { font-size: 13px; font-weight: 700; color: #545454; }
.ci-old      { font-size: 11px; color: #94a3b8; text-decoration: line-through; }
.ci-qty-wrap { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.qty-btn     { width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #fff; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .12s; }
.qty-btn:hover { background: #f8f9fa; border-color: #545454; }
.qty-val     { font-size: 14px; font-weight: 700; color: #545454; min-width: 24px; text-align: center; }
.ci-subtotal { font-size: 15px; font-weight: 800; color: #545454; min-width: 80px; text-align: right; flex-shrink: 0; }
.ci-remove   { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .12s; }
.ci-remove:hover { background: #fee2e2; color: #ef4444; }

/* Summary */
.summary-card  { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; padding: 24px; margin-bottom: 12px; }
.summary-title { font-size: 17px; font-weight: 800; color: #545454; margin-bottom: 18px; }
.summary-row   { display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 10px; }
.summary-val   { font-weight: 600; color: #545454; }
.summary-free  { color: #059669; font-weight: 600; }
.summary-divider { height: 1px; background: #f1f5f9; margin: 14px 0; }
.total-row     { font-size: 16px; font-weight: 700; color: #545454; margin-bottom: 20px; }
.total-val     { font-size: 20px; font-weight: 900; color: #545454; }
.btn-checkout  { width: 100%; padding: 14px; border-radius: 12px; background: #ffde59; color: #545454; font-size: 15px; font-weight: 800; border: none; cursor: pointer; margin-bottom: 12px; transition: transform .15s, box-shadow .15s; box-shadow: 0 4px 16px rgba(255,222,89,.35); }
.btn-checkout:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,222,89,.5); }
.continue-link { display: block; text-align: center; font-size: 13px; color: #94a3b8; text-decoration: none; }
.continue-link:hover { color: #545454; }

/* Trust */
.trust-badges { background: #fff; border-radius: 14px; border: 1px solid #f1f5f9; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.trust-row { display: flex; align-items: flex-start; gap: 12px; }
.trust-ic  { font-size: 22px; flex-shrink: 0; }
.trust-t   { font-size: 12px; font-weight: 700; color: #545454; margin-bottom: 2px; }
.trust-s   { font-size: 11px; color: #94a3b8; }

@media (max-width: 768px) {
  .cart-layout { grid-template-columns: 1fr; }
  .ci-subtotal { display: none; }
}
</style>
