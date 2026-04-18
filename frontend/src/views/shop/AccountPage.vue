<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { shopAuth } from '@/stores/shopAuth'
import { shopAPI } from '@/api/index'

const route  = useRoute()
const router = useRouter()

type TabId = 'profile' | 'orders' | 'addresses'
const tab    = ref<TabId>((route.query.tab as TabId) ?? 'profile')
const saving = ref(false)
const msg    = ref('')
const orders = ref<any[]>([])
const ordersLoading = ref(false)

// Profile form
const name  = ref('')
const phone = ref('')

// Address form
const showAddrForm  = ref(false)
const addrLabel     = ref('')
const addrStreet    = ref('')
const addrCity      = ref('')
const addrState     = ref('')
const addrZip       = ref('')
const addrCountry   = ref('Pakistan')

const customer = computed(() => shopAuth.customer)

onMounted(async () => {
  if (!shopAuth.isLoggedIn) { router.push('/login'); return }
  try {
    if (!customer.value) {
      const res = await shopAPI.getMe()
      shopAuth.setCustomer(res.data.data)
    }
    name.value  = customer.value?.name  ?? shopAuth.user?.name ?? ''
    phone.value = customer.value?.phone ?? ''
  } catch { /* silent */ }
})

async function saveProfile() {
  saving.value = true; msg.value = ''
  try {
    const res = await shopAPI.updateMe({ name: name.value, phone: phone.value })
    shopAuth.setCustomer(res.data.data)
    msg.value = 'Profile saved!'
  } catch (e: any) {
    msg.value = e.response?.data?.message ?? 'Save failed.'
  } finally { saving.value = false }
}

async function loadOrders() {
  ordersLoading.value = true
  try {
    const res = await shopAPI.getMyOrders()
    orders.value = res.data.data?.orders ?? res.data.data ?? []
  } catch { /* ignore */ } finally { ordersLoading.value = false }
}

function onTab(t: TabId) {
  tab.value = t
  if (t === 'orders' && !orders.value.length) loadOrders()
}

async function addAddress() {
  if (!addrStreet.value || !addrCity.value) { msg.value = 'Street and city are required.'; return }
  saving.value = true; msg.value = ''
  const current = customer.value?.addresses ?? []
  const updated = [...current, { label: addrLabel.value, street: addrStreet.value, city: addrCity.value, state: addrState.value, zip: addrZip.value, country: addrCountry.value }]
  try {
    const res = await shopAPI.updateMe({ addresses: updated })
    shopAuth.setCustomer(res.data.data)
    showAddrForm.value = false
    addrLabel.value = addrStreet.value = addrCity.value = addrState.value = addrZip.value = ''
    addrCountry.value = 'Pakistan'
    msg.value = 'Address added!'
  } catch (e: any) {
    msg.value = e.response?.data?.message ?? 'Failed to add address.'
  } finally { saving.value = false }
}

async function removeAddress(i: number) {
  const updated = (customer.value?.addresses ?? []).filter((_: any, idx: number) => idx !== i)
  saving.value = true
  try {
    const res = await shopAPI.updateMe({ addresses: updated })
    shopAuth.setCustomer(res.data.data)
  } finally { saving.value = false }
}

const statusColor: Record<string, string> = {
  pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6',
  delivered: '#22c55e', cancelled: '#ef4444',
}
</script>

<template>
  <div class="account-page">
    <div class="account-inner">

      <div class="account-layout">
        <!-- Sidebar -->
        <div class="account-sidebar">
          <div class="account-user">
            <div class="user-avatar">{{ (customer?.name ?? shopAuth.user?.name ?? 'U').charAt(0).toUpperCase() }}</div>
            <div>
              <p class="user-name">{{ customer?.name ?? shopAuth.user?.name }}</p>
              <p class="user-email">{{ shopAuth.user?.email }}</p>
            </div>
          </div>
          <nav class="account-nav">
            <button class="nav-item" :class="{ 'nav-item--active': tab === 'profile' }" @click="onTab('profile')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My Profile
            </button>
            <button class="nav-item" :class="{ 'nav-item--active': tab === 'orders' }" @click="onTab('orders')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              My Orders
            </button>
            <button class="nav-item" :class="{ 'nav-item--active': tab === 'addresses' }" @click="onTab('addresses')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Addresses
            </button>
            <button class="nav-item nav-item--danger" @click="shopAuth.clearAuth(); router.push('/')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </nav>
        </div>

        <!-- Content -->
        <div class="account-content">
          <p v-if="msg" class="msg-banner" :class="msg.includes('fail') || msg.includes('required') ? 'msg-err' : 'msg-ok'">{{ msg }}</p>

          <!-- Profile tab -->
          <div v-if="tab === 'profile'" class="tab-panel">
            <h2 class="tab-title">My Profile</h2>
            <div class="form-grid">
              <div class="field">
                <label class="field-lbl">Full Name</label>
                <input v-model="name" class="field-inp" placeholder="Ali Hassan" />
              </div>
              <div class="field">
                <label class="field-lbl">Email</label>
                <input :value="shopAuth.user?.email" class="field-inp" disabled />
              </div>
              <div class="field">
                <label class="field-lbl">Phone</label>
                <input v-model="phone" class="field-inp" placeholder="+92 300 1234567" type="tel" />
              </div>
            </div>
            <button class="btn-save" :disabled="saving" @click="saveProfile">{{ saving ? 'Saving…' : 'Save Changes' }}</button>
          </div>

          <!-- Orders tab -->
          <div v-if="tab === 'orders'" class="tab-panel">
            <h2 class="tab-title">My Orders</h2>
            <div v-if="ordersLoading" class="orders-loading">
              <div v-for="i in 3" :key="i" class="sk-order"></div>
            </div>
            <div v-else-if="orders.length === 0" class="orders-empty">
              <p>No orders yet.</p>
              <router-link to="/shop" class="shop-link">Browse Kits</router-link>
            </div>
            <div v-else class="orders-list">
              <div v-for="o in orders" :key="o._id" class="order-card">
                <div class="order-head">
                  <div>
                    <p class="order-id">#{{ o._id.slice(-8).toUpperCase() }}</p>
                    <p class="order-date">{{ new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
                  </div>
                  <div class="order-badges">
                    <span class="status-badge" :style="{ background: statusColor[o.status] + '22', color: statusColor[o.status] }">{{ o.status }}</span>
                    <span class="pay-badge" :class="o.paymentStatus === 'paid' ? 'pay-paid' : 'pay-pending'">{{ o.paymentStatus }}</span>
                  </div>
                  <p class="order-total">Rs {{ o.total?.toLocaleString() }}</p>
                </div>
                <div class="order-items">
                  <span v-for="item in o.items.slice(0,3)" :key="item._id ?? item.product" class="order-item-name">{{ item.product?.name ?? 'Item' }}</span>
                  <span v-if="o.items.length > 3" class="order-more">+{{ o.items.length - 3 }} more</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Addresses tab -->
          <div v-if="tab === 'addresses'" class="tab-panel">
            <div class="tab-head">
              <h2 class="tab-title">My Addresses</h2>
              <button class="btn-add-addr" @click="showAddrForm = !showAddrForm">{{ showAddrForm ? 'Cancel' : '+ Add Address' }}</button>
            </div>

            <!-- Add form -->
            <div v-if="showAddrForm" class="addr-form-box">
              <div class="form-row">
                <div class="field">
                  <label class="field-lbl">Label (e.g. Home)</label>
                  <input v-model="addrLabel" class="field-inp" placeholder="Home / Work" />
                </div>
                <div class="field">
                  <label class="field-lbl">Country</label>
                  <input v-model="addrCountry" class="field-inp" />
                </div>
              </div>
              <div class="field">
                <label class="field-lbl">Street Address *</label>
                <input v-model="addrStreet" class="field-inp" placeholder="House, Street" />
              </div>
              <div class="form-row">
                <div class="field">
                  <label class="field-lbl">City *</label>
                  <input v-model="addrCity" class="field-inp" />
                </div>
                <div class="field">
                  <label class="field-lbl">State</label>
                  <input v-model="addrState" class="field-inp" />
                </div>
                <div class="field" style="max-width:120px">
                  <label class="field-lbl">ZIP</label>
                  <input v-model="addrZip" class="field-inp" />
                </div>
              </div>
              <button class="btn-save" :disabled="saving" @click="addAddress" style="margin-top:4px">{{ saving ? 'Saving…' : 'Save Address' }}</button>
            </div>

            <div v-if="!customer?.addresses?.length" class="addresses-empty">No saved addresses.</div>
            <div v-else class="addresses-list">
              <div v-for="(a, i) in customer.addresses" :key="i" class="addr-card">
                <div class="addr-icon">📍</div>
                <div class="addr-info">
                  <p class="addr-label">{{ a.label || 'Address ' + (i + 1) }}</p>
                  <p class="addr-line">{{ a.street }}, {{ a.city }}, {{ a.state }} {{ a.zip }}</p>
                  <p class="addr-line">{{ a.country }}</p>
                </div>
                <button class="addr-del" @click="removeAddress(i)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-page  { background: #fafafa; min-height: 70vh; padding: 40px 0 80px; }
.account-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.account-layout { display: grid; grid-template-columns: 240px 1fr; gap: 24px; align-items: start; }

/* Sidebar */
.account-sidebar { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; overflow: hidden; position: sticky; top: 88px; }
.account-user { display: flex; gap: 12px; align-items: center; padding: 20px; border-bottom: 1px solid #f1f5f9; }
.user-avatar  { width: 44px; height: 44px; border-radius: 50%; background: #545454; color: #ffde59; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-name    { font-size: 13px; font-weight: 700; color: #545454; }
.user-email   { font-size: 11px; color: #94a3b8; margin-top: 2px; word-break: break-all; }
.account-nav  { padding: 8px 0; }
.nav-item     { width: 100%; display: flex; align-items: center; gap: 10px; padding: 11px 20px; font-size: 13px; font-weight: 600; color: #64748b; background: transparent; border: none; cursor: pointer; text-align: left; transition: all .12s; }
.nav-item:hover { background: #f8fafc; color: #545454; }
.nav-item--active { background: #fafafa; color: #545454; border-left: 3px solid #ffde59; }
.nav-item--danger { color: #ef4444 !important; }
.nav-item--danger:hover { background: #fee2e2 !important; }

/* Content */
.account-content { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; padding: 28px; }
.msg-banner { padding: 10px 14px; border-radius: 10px; font-size: 12px; margin-bottom: 16px; }
.msg-ok  { background: #dcfce7; color: #166534; }
.msg-err { background: #fee2e2; color: #dc2626; }
.tab-title { font-size: 20px; font-weight: 800; color: #545454; margin-bottom: 22px; }
.tab-panel { }
.tab-head  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.tab-head .tab-title { margin-bottom: 0; }

/* Form */
.form-grid { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
.form-row  { display: flex; gap: 12px; flex-wrap: wrap; }
.field     { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 0; }
.field-lbl { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .04em; }
.field-inp { padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 13px; color: #545454; outline: none; transition: border-color .15s; }
.field-inp:focus   { border-color: #ffde59; }
.field-inp:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }
.btn-save  { padding: 11px 22px; border-radius: 11px; background: #545454; color: #ffde59; font-size: 13px; font-weight: 800; border: none; cursor: pointer; transition: opacity .15s; }
.btn-save:hover:not(:disabled) { opacity: .85; }
.btn-save:disabled { opacity: .5; cursor: not-allowed; }

/* Orders */
.sk-order  { height: 88px; background: #f1f5f9; border-radius: 12px; margin-bottom: 10px; animation: pulse 1.4s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.5} }
.orders-empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 14px; }
.shop-link { display: inline-block; margin-top: 12px; padding: 10px 20px; border-radius: 10px; background: #545454; color: #ffde59; text-decoration: none; font-size: 13px; font-weight: 700; }
.orders-list { display: flex; flex-direction: column; gap: 12px; }
.order-card  { background: #fafafa; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; }
.order-head  { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
.order-id    { font-size: 13px; font-weight: 800; color: #545454; font-family: monospace; }
.order-date  { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.order-badges { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.status-badge { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
.pay-badge    { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
.pay-paid     { background: #dcfce7; color: #166534; }
.pay-pending  { background: #fef9c3; color: #854d0e; }
.order-total  { margin-left: auto; font-size: 15px; font-weight: 900; color: #545454; }
.order-items  { display: flex; gap: 6px; flex-wrap: wrap; }
.order-item-name { font-size: 11px; color: #64748b; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; }
.order-more  { font-size: 11px; color: #94a3b8; padding: 3px 8px; }

/* Addresses */
.btn-add-addr  { padding: 9px 16px; border-radius: 10px; border: 1.5px dashed #e2e8f0; background: transparent; font-size: 12px; font-weight: 600; color: #64748b; cursor: pointer; }
.btn-add-addr:hover { border-color: #545454; color: #545454; }
.addr-form-box { background: #fafafa; border-radius: 12px; padding: 16px; border: 1px solid #f1f5f9; margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px; }
.addresses-empty { text-align: center; padding: 32px; color: #94a3b8; font-size: 13px; }
.addresses-list  { display: flex; flex-direction: column; gap: 10px; }
.addr-card  { display: flex; align-items: flex-start; gap: 12px; padding: 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; }
.addr-icon  { font-size: 20px; flex-shrink: 0; }
.addr-info  { flex: 1; }
.addr-label { font-size: 13px; font-weight: 700; color: #545454; margin-bottom: 3px; }
.addr-line  { font-size: 12px; color: #64748b; }
.addr-del   { width: 30px; height: 30px; border-radius: 8px; border: none; background: transparent; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.addr-del:hover { background: #fee2e2; color: #ef4444; }

@media (max-width: 768px) {
  .account-layout { grid-template-columns: 1fr; }
  .account-sidebar { position: static; }
}
</style>
