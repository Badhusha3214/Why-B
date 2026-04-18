<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { shopAPI } from '@/api/index'

const router = useRouter()
const order  = ref<any>(history.state?.order ?? null)

onMounted(() => {
  if (!order.value) router.push('/shop')
})

function statusColor(s: string) {
  const m: Record<string,string> = { pending:'#f59e0b', processing:'#3b82f6', delivered:'#22c55e', cancelled:'#ef4444' }
  return m[s] ?? '#64748b'
}
</script>

<template>
  <div class="success-page">
    <div class="success-inner" v-if="order">

      <div class="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="48" height="48"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <h1 class="success-title">Order Placed!</h1>
      <p class="success-sub">Thank you for your purchase. We'll start processing your kit right away.</p>

      <div class="order-card">
        <div class="order-meta-row">
          <div>
            <p class="meta-lbl">Order ID</p>
            <p class="meta-val">#{{ order._id?.slice(-10).toUpperCase() }}</p>
          </div>
          <div>
            <p class="meta-lbl">Status</p>
            <span class="status-chip" :style="{ background: statusColor(order.status) + '22', color: statusColor(order.status) }">{{ order.status }}</span>
          </div>
          <div>
            <p class="meta-lbl">Payment</p>
            <span class="pay-chip" :class="order.paymentStatus === 'paid' ? 'paid' : 'pending'">{{ order.paymentStatus }}</span>
          </div>
          <div>
            <p class="meta-lbl">Total</p>
            <p class="meta-val total">Rs {{ order.total?.toLocaleString() }}</p>
          </div>
        </div>

        <div class="order-items">
          <p class="items-title">Items Ordered</p>
          <div v-for="item in order.items" :key="item._id" class="order-item">
            <div class="oi-img-wrap">
              <img v-if="item.product?.images?.[0]" :src="item.product.images[0]" class="oi-img" :alt="item.product.name" />
              <div v-else class="oi-img-blank"></div>
            </div>
            <div class="oi-info">
              <p class="oi-name">{{ item.product?.name ?? 'Kit' }}</p>
              <p class="oi-qty">Qty: {{ item.quantity }}</p>
            </div>
            <span class="oi-price">Rs {{ ((item.salePrice ?? item.unitPrice) * item.quantity).toLocaleString() }}</span>
          </div>
        </div>

        <div v-if="order.shippingAddress" class="ship-addr">
          <p class="ship-lbl">Delivering to:</p>
          <p class="ship-val">{{ order.shippingAddress.street }}, {{ order.shippingAddress.city }}, {{ order.shippingAddress.country }}</p>
        </div>
      </div>

      <div class="success-btns">
        <router-link to="/account?tab=orders" class="btn-orders">View My Orders</router-link>
        <router-link to="/shop" class="btn-shop">Continue Shopping</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success-page  { background: #fafafa; min-height: 70vh; padding: 60px 20px 80px; }
.success-inner { max-width: 640px; margin: 0 auto; text-align: center; }
.success-icon  { width: 80px; height: 80px; border-radius: 50%; background: #dcfce7; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
.success-title { font-size: 30px; font-weight: 900; color: #545454; margin-bottom: 10px; }
.success-sub   { font-size: 15px; color: #64748b; margin-bottom: 32px; line-height: 1.6; }

.order-card    { background: #fff; border-radius: 18px; border: 1px solid #f1f5f9; padding: 24px; text-align: left; margin-bottom: 28px; }
.order-meta-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; margin-bottom: 20px; }
.meta-lbl  { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 5px; }
.meta-val  { font-size: 14px; font-weight: 700; color: #545454; font-family: monospace; }
.meta-val.total { font-size: 18px; font-family: inherit; }
.status-chip { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
.pay-chip  { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
.pay-chip.paid    { background: #dcfce7; color: #166534; }
.pay-chip.pending { background: #fef9c3; color: #854d0e; }

.items-title { font-size: 13px; font-weight: 700; color: #545454; margin-bottom: 12px; }
.order-items { margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; }
.order-item  { display: flex; align-items: center; gap: 12px; }
.oi-img-wrap { width: 52px; height: 52px; border-radius: 9px; overflow: hidden; flex-shrink: 0; background: #f8fafc; }
.oi-img      { width: 100%; height: 100%; object-fit: cover; }
.oi-img-blank { width: 100%; height: 100%; background: #f1f5f9; }
.oi-info     { flex: 1; }
.oi-name     { font-size: 13px; font-weight: 600; color: #545454; }
.oi-qty      { font-size: 11px; color: #94a3b8; }
.oi-price    { font-size: 13px; font-weight: 700; color: #545454; flex-shrink: 0; }

.ship-addr { background: #fafafa; border-radius: 10px; padding: 12px 14px; border: 1px solid #f1f5f9; }
.ship-lbl  { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; }
.ship-val  { font-size: 13px; color: #545454; }

.success-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn-orders   { padding: 13px 24px; border-radius: 12px; background: #545454; color: #ffde59; font-size: 14px; font-weight: 700; text-decoration: none; }
.btn-shop     { padding: 13px 24px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: transparent; font-size: 14px; font-weight: 600; color: #545454; text-decoration: none; }

@media (max-width: 600px) {
  .order-meta-row { grid-template-columns: repeat(2, 1fr); }
}
</style>
