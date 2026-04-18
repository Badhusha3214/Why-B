<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { cart } from '@/stores/cart'
import { shopAuth } from '@/stores/shopAuth'
import { shopAPI } from '@/api/index'

const router = useRouter()

interface AddrForm {
  label: string; street: string; city: string; state: string; zip: string; country: string
}
const blankAddr = (): AddrForm => ({ label: '', street: '', city: '', state: '', zip: '', country: 'Pakistan' })

const step         = ref<1|2|3>(1) // 1=address, 2=payment, 3=review
const addingAddr   = ref(false)
const addrForm     = ref<AddrForm>(blankAddr())
const selectedAddr = ref<number>(-1) // index into shopAuth.customer.addresses

const payMethod = ref<'cod'|'card'>('cod')
const couponCode = ref('')
const couponData = ref<any>(null)
const couponErr  = ref('')
const couponLoad = ref(false)

const cardNum   = ref('')
const cardName  = ref('')
const cardExp   = ref('')
const cardCvv   = ref('')

const notes      = ref('')
const placing    = ref(false)
const errorMsg   = ref('')

const customer = computed(() => shopAuth.customer)

onMounted(async () => {
  if (!shopAuth.isLoggedIn) { router.push('/login?redirect=/checkout'); return }
  if (!shopAuth.customer) {
    const res = await shopAPI.getMe()
    shopAuth.setCustomer(res.data.data)
  }
})

async function validateCoupon() {
  if (!couponCode.value.trim()) return
  couponLoad.value = true; couponErr.value = ''; couponData.value = null
  try {
    const res = await shopAPI.validateCoupon(couponCode.value.trim())
    couponData.value = res.data.data
  } catch (e: any) {
    couponErr.value = e.response?.data?.message ?? 'Invalid coupon'
  } finally { couponLoad.value = false }
}

const subtotal = computed(() => cart.subtotal.value)
const discount = computed(() => {
  if (!couponData.value) return 0
  if (couponData.value.discountType === 'percent') return Math.round(subtotal.value * couponData.value.discountValue / 100)
  return Math.min(couponData.value.discountValue, subtotal.value)
})
const total = computed(() => Math.max(0, subtotal.value - discount.value))

async function placeOrder() {
  errorMsg.value = ''
  if (selectedAddr.value === -1 && !addingAddr.value) { errorMsg.value = 'Please select a delivery address.'; return }
  const addr = selectedAddr.value >= 0
    ? customer.value?.addresses?.[selectedAddr.value]
    : { ...addrForm.value }
  if (!addr?.street) { errorMsg.value = 'Please fill in the delivery address.'; return }

  placing.value = true
  try {
    const payload: any = {
      items: cart.items.map(i => ({ product: i.productId, quantity: i.quantity })),
      shippingAddress: addr,
      paymentMethod:   payMethod.value,
      notes:           notes.value,
    }
    if (couponData.value) payload.couponCode = couponCode.value.trim()
    const res = await shopAPI.createOrder(payload)
    const order = res.data.data
    cart.clear()
    router.push({ name: 'order-success', state: { order } })
  } catch (e: any) {
    errorMsg.value = e.response?.data?.message ?? 'Failed to place order. Try again.'
  } finally { placing.value = false }
}
</script>

<template>
  <div class="checkout-page">
    <div class="checkout-inner">

      <div class="checkout-head">
        <h1 class="checkout-title">Checkout</h1>
        <!-- Steps -->
        <div class="steps">
          <div class="step-dot" :class="{ active: step >= 1, done: step > 1 }">
            <span>{{ step > 1 ? '✓' : '1' }}</span>
          </div>
          <div class="step-line" :class="{ done: step > 1 }"></div>
          <div class="step-dot" :class="{ active: step >= 2, done: step > 2 }">
            <span>{{ step > 2 ? '✓' : '2' }}</span>
          </div>
          <div class="step-line" :class="{ done: step > 2 }"></div>
          <div class="step-dot" :class="{ active: step >= 3 }"><span>3</span></div>
        </div>
        <div class="step-labels">
          <span :class="{ 'step-lbl-active': step === 1 }">Delivery</span>
          <span :class="{ 'step-lbl-active': step === 2 }">Payment</span>
          <span :class="{ 'step-lbl-active': step === 3 }">Review</span>
        </div>
      </div>

      <div class="checkout-layout">

        <!-- Left panel -->
        <div class="checkout-form">

          <!-- Step 1: Address -->
          <div v-if="step === 1" class="form-section">
            <h2 class="form-section-title">Delivery Address</h2>

            <!-- Saved addresses -->
            <div v-if="customer?.addresses?.length" class="saved-addrs">
              <p class="saved-lbl">Saved addresses:</p>
              <div
                v-for="(a, i) in customer.addresses" :key="i"
                class="addr-card" :class="{ 'addr-card--sel': selectedAddr === i }"
                @click="selectedAddr = i; addingAddr = false"
              >
                <div class="addr-radio">
                  <div class="radio-dot" :class="{ 'radio-dot--on': selectedAddr === i }"></div>
                </div>
                <div>
                  <p class="addr-label">{{ a.label || 'Address ' + (i + 1) }}</p>
                  <p class="addr-text">{{ a.street }}, {{ a.city }}, {{ a.state }} {{ a.zipCode }}</p>
                  <p class="addr-text">{{ a.country }}</p>
                </div>
              </div>
            </div>

            <!-- Add new -->
            <button v-if="!addingAddr" class="btn-add-addr" @click="addingAddr = true; selectedAddr = -1; addrForm = blankAddr()">
              + Add New Address
            </button>
            <div v-if="addingAddr" class="addr-form">
              <p class="form-section-title" style="font-size:14px;margin-bottom:14px">New Address</p>
              <div class="field-row">
                <div class="field">
                  <label class="field-lbl">Label (e.g. Home)</label>
                  <input v-model="addrForm.label" class="field-inp" placeholder="Home / Work" />
                </div>
                <div class="field">
                  <label class="field-lbl">Country</label>
                  <input v-model="addrForm.country" class="field-inp" placeholder="Pakistan" />
                </div>
              </div>
              <div class="field">
                <label class="field-lbl">Street Address *</label>
                <input v-model="addrForm.street" class="field-inp" placeholder="House / Flat, Street name" />
              </div>
              <div class="field-row">
                <div class="field">
                  <label class="field-lbl">City *</label>
                  <input v-model="addrForm.city" class="field-inp" placeholder="Lahore" />
                </div>
                <div class="field">
                  <label class="field-lbl">State / Province</label>
                  <input v-model="addrForm.state" class="field-inp" placeholder="Punjab" />
                </div>
                <div class="field" style="max-width:120px">
                  <label class="field-lbl">ZIP / Postal</label>
                  <input v-model="addrForm.zip" class="field-inp" placeholder="54000" />
                </div>
              </div>
            </div>

            <div class="field" style="margin-top:16px">
              <label class="field-lbl">Order Notes (optional)</label>
              <textarea v-model="notes" class="field-inp field-ta" placeholder="Any special instructions…" rows="2"></textarea>
            </div>

            <p v-if="errorMsg" class="err-msg">{{ errorMsg }}</p>
            <button class="btn-next" @click="step = 2">Continue to Payment →</button>
          </div>

          <!-- Step 2: Payment -->
          <div v-if="step === 2" class="form-section">
            <h2 class="form-section-title">Payment Method</h2>

            <div class="pay-option" :class="{ 'pay-option--sel': payMethod === 'cod' }" @click="payMethod = 'cod'">
              <div class="radio-dot" :class="{ 'radio-dot--on': payMethod === 'cod' }"></div>
              <div class="pay-info">
                <p class="pay-name">💵 Cash on Delivery</p>
                <p class="pay-sub">Pay when your kit arrives</p>
              </div>
            </div>

            <div class="pay-option" :class="{ 'pay-option--sel': payMethod === 'card' }" @click="payMethod = 'card'">
              <div class="radio-dot" :class="{ 'radio-dot--on': payMethod === 'card' }"></div>
              <div class="pay-info">
                <p class="pay-name">💳 Card Payment</p>
                <p class="pay-sub">Demo — no real transaction</p>
              </div>
            </div>

            <div v-if="payMethod === 'card'" class="card-fields">
              <div class="field">
                <label class="field-lbl">Card Number</label>
                <input v-model="cardNum" class="field-inp" placeholder="1234 5678 9012 3456" maxlength="19" />
              </div>
              <div class="field">
                <label class="field-lbl">Cardholder Name</label>
                <input v-model="cardName" class="field-inp" placeholder="Ali Hassan" />
              </div>
              <div class="field-row">
                <div class="field">
                  <label class="field-lbl">Expiry</label>
                  <input v-model="cardExp" class="field-inp" placeholder="MM/YY" maxlength="5" />
                </div>
                <div class="field" style="max-width:120px">
                  <label class="field-lbl">CVV</label>
                  <input v-model="cardCvv" class="field-inp" placeholder="123" maxlength="3" type="password" />
                </div>
              </div>
              <div class="demo-notice">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Demo only — no real payment is processed.
              </div>
            </div>

            <!-- Coupon -->
            <div class="coupon-row">
              <input v-model="couponCode" class="field-inp coupon-inp" placeholder="Coupon code (optional)" />
              <button class="btn-apply" :disabled="couponLoad" @click="validateCoupon">{{ couponLoad ? '…' : 'Apply' }}</button>
            </div>
            <p v-if="couponErr" class="err-msg">{{ couponErr }}</p>
            <p v-if="couponData" class="coupon-ok">
              ✓ Coupon applied! You save Rs {{ discount.toLocaleString() }}.
            </p>

            <div class="step-nav">
              <button class="btn-back" @click="step = 1">← Back</button>
              <button class="btn-next" @click="step = 3">Review Order →</button>
            </div>
          </div>

          <!-- Step 3: Review & Place -->
          <div v-if="step === 3" class="form-section">
            <h2 class="form-section-title">Review Your Order</h2>

            <div class="review-summary">
              <div class="review-row">
                <span class="review-lbl">Delivery to:</span>
                <span class="review-val">
                  <template v-if="selectedAddr >= 0">
                    {{ customer?.addresses?.[selectedAddr]?.street }}, {{ customer?.addresses?.[selectedAddr]?.city }}
                  </template>
                  <template v-else>{{ addrForm.street }}, {{ addrForm.city }}</template>
                </span>
              </div>
              <div class="review-row">
                <span class="review-lbl">Payment:</span>
                <span class="review-val">{{ payMethod === 'cod' ? 'Cash on Delivery' : 'Card (Demo)' }}</span>
              </div>
              <div v-if="couponData" class="review-row">
                <span class="review-lbl">Coupon:</span>
                <span class="review-val coupon-tag">{{ couponCode }} — Save Rs {{ discount.toLocaleString() }}</span>
              </div>
            </div>

            <p v-if="errorMsg" class="err-msg">{{ errorMsg }}</p>
            <div class="step-nav">
              <button class="btn-back" @click="step = 2">← Back</button>
              <button class="btn-place" :disabled="placing" @click="placeOrder">
                {{ placing ? 'Placing Order…' : 'Place Order ✓' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Order summary sidebar -->
        <div class="order-summary">
          <div class="os-card">
            <h2 class="os-title">Order Items</h2>
            <div class="os-items">
              <div v-for="item in cart.items" :key="item.productId" class="os-item">
                <div class="os-img-wrap">
                  <img v-if="item.image" :src="item.image" class="os-img" :alt="item.name" />
                  <div v-else class="os-img-blank"></div>
                </div>
                <div class="os-item-info">
                  <p class="os-item-name">{{ item.name }}</p>
                  <p class="os-item-qty">Qty: {{ item.quantity }}</p>
                </div>
                <span class="os-item-price">Rs {{ ((item.salePrice ?? item.price) * item.quantity).toLocaleString() }}</span>
              </div>
            </div>
            <div class="os-divider"></div>
            <div class="os-row"><span>Subtotal</span><span>Rs {{ subtotal.toLocaleString() }}</span></div>
            <div v-if="discount > 0" class="os-row discount-row"><span>Discount</span><span>− Rs {{ discount.toLocaleString() }}</span></div>
            <div class="os-divider"></div>
            <div class="os-row os-total"><span>Total</span><span>Rs {{ total.toLocaleString() }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-page  { background: #fafafa; min-height: 60vh; padding: 40px 0 80px; }
.checkout-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.checkout-head  { margin-bottom: 32px; }
.checkout-title { font-size: 26px; font-weight: 800; color: #545454; margin-bottom: 20px; }

/* Steps */
.steps       { display: flex; align-items: center; margin-bottom: 8px; }
.step-dot    { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #e2e8f0; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #94a3b8; transition: all .2s; }
.step-dot.active { border-color: #545454; color: #545454; }
.step-dot.done   { border-color: #22c55e; background: #22c55e; color: #fff; }
.step-line   { flex: 1; height: 2px; background: #e2e8f0; transition: background .2s; }
.step-line.done  { background: #22c55e; }
.step-labels { display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; }
.step-lbl-active { color: #545454; font-weight: 700; }

/* Layout */
.checkout-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
.checkout-form   { display: flex; flex-direction: column; gap: 16px; }
.form-section    { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; padding: 24px; }
.form-section-title { font-size: 16px; font-weight: 800; color: #545454; margin-bottom: 18px; }

/* Address */
.saved-lbl   { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 10px; }
.addr-card   { display: flex; gap: 12px; align-items: flex-start; padding: 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; cursor: pointer; margin-bottom: 10px; transition: all .15s; }
.addr-card--sel  { border-color: #545454; background: #fafafa; }
.addr-label  { font-size: 13px; font-weight: 700; color: #545454; margin-bottom: 3px; }
.addr-text   { font-size: 12px; color: #64748b; }
.radio-dot   { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #e2e8f0; flex-shrink: 0; transition: all .15s; margin-top: 2px; }
.radio-dot--on { border-color: #545454; background: #545454; border-width: 4px; }
.btn-add-addr { padding: 9px 16px; border-radius: 10px; border: 1.5px dashed #e2e8f0; background: transparent; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; transition: all .12s; width: 100%; }
.btn-add-addr:hover { border-color: #545454; color: #545454; }
.addr-form   { background: #fafafa; border-radius: 12px; padding: 16px; border: 1px solid #f1f5f9; margin-top: 10px; }

/* Fields */
.field-row   { display: flex; gap: 12px; flex-wrap: wrap; }
.field       { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 0; }
.field-lbl   { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .04em; }
.field-inp   { padding: 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 13px; color: #545454; outline: none; transition: border-color .15s; background: #fff; }
.field-inp:focus { border-color: #ffde59; }
.field-ta    { resize: none; }

/* Payment */
.pay-option  { display: flex; align-items: flex-start; gap: 12px; padding: 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; cursor: pointer; margin-bottom: 10px; transition: all .15s; }
.pay-option--sel { border-color: #545454; background: #fafafa; }
.pay-name    { font-size: 14px; font-weight: 700; color: #545454; margin-bottom: 2px; }
.pay-sub     { font-size: 12px; color: #94a3b8; }
.card-fields { background: #fafafa; border-radius: 12px; padding: 16px; margin-top: 4px; border: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 12px; }
.demo-notice { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #94a3b8; background: #f8fafc; padding: 8px 12px; border-radius: 8px; }
.coupon-row  { display: flex; gap: 8px; margin-top: 16px; }
.coupon-inp  { flex: 1; }
.btn-apply   { padding: 9px 16px; border-radius: 9px; background: #545454; color: #ffde59; font-size: 13px; font-weight: 700; border: none; cursor: pointer; flex-shrink: 0; }
.btn-apply:disabled { opacity: .5; cursor: not-allowed; }
.coupon-ok   { font-size: 12px; color: #059669; margin-top: 6px; }

/* Review summary */
.review-summary { background: #fafafa; border-radius: 12px; padding: 16px; border: 1px solid #f1f5f9; margin-bottom: 20px; }
.review-row  { display: flex; gap: 12px; font-size: 13px; margin-bottom: 8px; }
.review-lbl  { color: #94a3b8; min-width: 90px; flex-shrink: 0; }
.review-val  { color: #545454; font-weight: 600; }
.coupon-tag  { color: #059669; }

/* Buttons */
.btn-next    { width: 100%; padding: 14px; border-radius: 12px; background: #545454; color: #ffde59; font-size: 15px; font-weight: 800; border: none; cursor: pointer; margin-top: 16px; transition: opacity .15s; }
.btn-next:hover { opacity: .85; }
.step-nav    { display: flex; gap: 10px; margin-top: 16px; }
.btn-back    { padding: 13px 20px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: transparent; font-size: 14px; font-weight: 600; color: #545454; cursor: pointer; }
.btn-back:hover { border-color: #545454; }
.btn-place   { flex: 1; padding: 14px; border-radius: 12px; background: #ffde59; color: #545454; font-size: 15px; font-weight: 800; border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(255,222,89,.4); transition: all .15s; }
.btn-place:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,222,89,.5); }
.btn-place:disabled { opacity: .6; cursor: not-allowed; }
.err-msg     { font-size: 12px; color: #ef4444; margin-top: 8px; }

/* Summary sidebar */
.os-card  { background: #fff; border-radius: 16px; border: 1px solid #f1f5f9; padding: 20px; position: sticky; top: 88px; }
.os-title { font-size: 15px; font-weight: 800; color: #545454; margin-bottom: 14px; }
.os-items { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.os-item  { display: flex; align-items: center; gap: 10px; }
.os-img-wrap { width: 48px; height: 48px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: #f8fafc; }
.os-img   { width: 100%; height: 100%; object-fit: cover; }
.os-img-blank { width: 100%; height: 100%; background: #f1f5f9; }
.os-item-info { flex: 1; min-width: 0; }
.os-item-name { font-size: 12px; font-weight: 600; color: #545454; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.os-item-qty  { font-size: 11px; color: #94a3b8; }
.os-item-price { font-size: 12px; font-weight: 700; color: #545454; flex-shrink: 0; }
.os-divider { height: 1px; background: #f1f5f9; margin: 10px 0; }
.os-row     { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 6px; }
.os-total   { font-size: 16px; font-weight: 800; color: #545454; margin-top: 4px; }
.discount-row span:last-child { color: #059669; font-weight: 700; }

@media (max-width: 768px) {
  .checkout-layout { grid-template-columns: 1fr; }
  .order-summary { order: -1; }
}
</style>
