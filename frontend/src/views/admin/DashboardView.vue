<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { dashboardAPI } from '@/api/index'
import {
  Chart, BarController, BarElement, CategoryScale, LinearScale,
  Tooltip, Legend, DoughnutController, ArcElement,
} from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, ArcElement)

interface RecentOrder {
  _id: string; status: string; paymentStatus: string; totalAmount: number
  createdAt: string; customer?: { name: string; email: string }
}
interface TopProduct { _id: string; name: string; totalSold: number }
interface Stats {
  totalRevenue: number; totalOrders: number; totalProducts: number
  totalCustomers: number; pendingReviews: number
  recentOrders: RecentOrder[]
  revenueByMonth?: { month: string; revenue: number }[]
  ordersByStatus?: Record<string, number>
  topProducts?: TopProduct[]
}

const stats     = ref<Stats | null>(null)
const loading   = ref(true)
const barCanvas = ref<HTMLCanvasElement | null>(null)
const doCanvas  = ref<HTMLCanvasElement | null>(null)
let barChart: Chart | null = null
let doChart:  Chart | null = null

const kpiCards = computed(() => {
  if (!stats.value) return []
  const s = stats.value
  return [
    { label: 'Total Revenue',   value: 'Rs ' + (s.totalRevenue ?? 0).toLocaleString(),  icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', accent: '#ffde59' },
    { label: 'Total Orders',    value: s.totalOrders,    icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',   accent: '#3b82f6' },
    { label: 'Active Kits',     value: s.totalProducts,  icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', accent: '#7c3aed' },
    { label: 'Students',        value: s.totalCustomers, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', accent: '#059669' },
    { label: 'Pending Reviews', value: s.pendingReviews, icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', accent: '#f59e0b' },
  ]
})

function renderCharts() {
  if (!stats.value) return
  if (barChart) { barChart.destroy(); barChart = null }
  if (doChart)  { doChart.destroy();  doChart  = null }

  const mData   = stats.value.revenueByMonth ?? []
  const bLabels = mData.length ? mData.map(r => r.month)   : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const bValues = mData.length ? mData.map(r => r.revenue) : Array(12).fill(0)

  if (barCanvas.value) {
    barChart = new Chart(barCanvas.value, {
      type: 'bar',
      data: {
        labels: bLabels,
        datasets: [{
          label: 'Revenue (Rs)',
          data: bValues,
          backgroundColor: bValues.map(v => v > 0 ? '#ffde59' : 'rgba(84,84,84,0.1)'),
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => 'Rs ' + Number(c.raw).toLocaleString() } },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, callback: (v) => 'Rs ' + Number(v).toLocaleString() } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        },
      },
    })
  }

  const statusObj  = stats.value.ordersByStatus ?? {}
  const sKeys      = Object.keys(statusObj)
  const sVals      = Object.values(statusObj) as number[]
  const hasOrders  = sVals.reduce((a, b) => a + b, 0) > 0

  if (doCanvas.value) {
    doChart = new Chart(doCanvas.value, {
      type: 'doughnut',
      data: {
        labels: hasOrders ? sKeys : ['No orders yet'],
        datasets: [{
          data: hasOrders ? sVals : [1],
          backgroundColor: hasOrders ? ['#ffde59','#545454','#7c3aed','#059669','#3b82f6','#ef4444'] : ['#e5e7eb'],
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: { legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 }, usePointStyle: true } } },
      },
    })
  }
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusBadgeClass: Record<string, string> = {
  pending: 'badge-yellow', processing: 'badge-blue', shipped: 'badge-blue',
  delivered: 'badge-green', cancelled: 'badge-red',
}
const payBadgeClass: Record<string, string> = {
  paid: 'badge-green', pending: 'badge-yellow', failed: 'badge-red',
}

const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'
})

onMounted(async () => {
  try {
    const res   = await dashboardAPI.getStats()
    stats.value = res.data.data
  } catch { /* show empty state */ } finally {
    loading.value = false
    await nextTick()
    renderCharts()
  }
})

onUnmounted(() => { barChart?.destroy(); doChart?.destroy() })
</script>

<template>
  <div>

    <!-- Loading -->
    <div v-if="loading" class="load-wrap">
      <div class="load-spinner"></div>
      <p>Loading dashboard...</p>
    </div>

    <template v-else>

      <!-- Pending reviews alert -->
      <div v-if="stats && stats.pendingReviews > 0" class="reviews-alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
        </svg>
        <span><strong>{{ stats.pendingReviews }} review{{ stats.pendingReviews !== 1 ? 's' : '' }}</strong> awaiting moderation</span>
        <router-link :to="{ name: 'reviews' }" class="alert-link">Moderate now ?</router-link>
      </div>

      <!-- Welcome -->
      <div class="welcome-row">
        <div>
          <h2 class="welcome-title">{{ greeting }}, Admin</h2>
          <p class="welcome-sub">Here's an overview of Fris-b today.</p>
        </div>
        <div class="welcome-date">
          {{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }}
        </div>
      </div>

      <!-- KPI Cards -->
      <div v-if="stats" class="kpi-grid">
        <div v-for="c in kpiCards" :key="c.label" class="kpi-card" :style="{ borderTopColor: c.accent }">
          <div class="kpi-icon-wrap" :style="{ background: c.accent + '20', color: c.accent === '#ffde59' ? '#545454' : c.accent }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
              <path :d="c.icon" />
            </svg>
          </div>
          <div>
            <p class="kpi-label">{{ c.label }}</p>
            <p class="kpi-value">{{ c.value }}</p>
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div v-if="stats" class="charts-row">
        <!-- Bar: monthly revenue -->
        <div class="chart-card chart-wide">
          <div class="chart-head">
            <div>
              <h3 class="chart-title">Monthly Revenue</h3>
              <p class="chart-sub">Paid orders � last 12 months</p>
            </div>
            <div class="chart-badge">Rs {{ (stats.totalRevenue ?? 0).toLocaleString() }} total</div>
          </div>
          <canvas ref="barCanvas" height="160"></canvas>
        </div>

        <!-- Doughnut: order status -->
        <div class="chart-card">
          <div class="chart-head">
            <div>
              <h3 class="chart-title">Orders by Status</h3>
              <p class="chart-sub">Across all {{ stats.totalOrders }} orders</p>
            </div>
          </div>
          <div class="donut-wrap">
            <canvas ref="doCanvas"></canvas>
            <div class="donut-center">
              <span class="donut-num">{{ stats.totalOrders }}</span>
              <span class="donut-lbl">orders</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Middle row -->
      <div v-if="stats" class="mid-row">

        <!-- How Fris-b Works � kit concept -->
        <div class="how-card">
          <h3 class="how-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15" style="display:inline;vertical-align:-2px;margin-right:6px">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            How Fris-b Works
          </h3>
          <p class="how-sub">Every project is a complete STEAM kit. Students buy a project and receive all the physical components needed to build it.</p>

          <div class="how-steps">
            <div class="how-step">
              <div class="step-circle">1</div>
              <div class="step-body">
                <p class="step-title">Pick a Project Kit</p>
                <p class="step-desc">Students browse projects � Drone, RC Car, Drip Irrigation, Robotic Arm � and choose what they want to build.</p>
              </div>
            </div>
            <div class="step-arrow">?</div>
            <div class="how-step">
              <div class="step-circle">2</div>
              <div class="step-body">
                <p class="step-title">All Components Auto-Added</p>
                <p class="step-desc">Every linked component is automatically included in the order � no separate shopping required.</p>
              </div>
            </div>
            <div class="step-arrow">?</div>
            <div class="how-step">
              <div class="step-circle">3</div>
              <div class="step-body">
                <p class="step-title">Build &amp; Learn</p>
                <p class="step-desc">Students receive the full kit and follow step-by-step guides to build and understand their STEAM project.</p>
              </div>
            </div>
          </div>

          <div class="how-stats-row">
            <div class="how-stat">
              <span class="hs-val">{{ stats.totalProducts }}</span>
              <span class="hs-lbl">Active Kits</span>
            </div>
            <div class="how-stat">
              <span class="hs-val">{{ stats.totalOrders }}</span>
              <span class="hs-lbl">Orders Placed</span>
            </div>
            <div class="how-stat">
              <span class="hs-val">{{ stats.totalCustomers }}</span>
              <span class="hs-lbl">Students</span>
            </div>
          </div>
        </div>

        <!-- Recent orders -->
        <div class="orders-card">
          <div class="orders-head">
            <h3 class="chart-title">Recent Orders</h3>
            <router-link :to="{ name: 'orders' }" class="see-all-link">View all ?</router-link>
          </div>

          <div v-if="!stats.recentOrders?.length" class="orders-empty">No orders yet.</div>

          <div v-else class="orders-list">
            <div v-for="o in stats.recentOrders" :key="o._id" class="order-item">
              <div class="order-avatar">{{ (o.customer?.name ?? 'U').charAt(0).toUpperCase() }}</div>
              <div class="order-info">
                <p class="order-name">{{ o.customer?.name ?? 'Unknown Customer' }}</p>
                <p class="order-email">{{ o.customer?.email ?? '' }}</p>
              </div>
              <div class="order-right">
                <p class="order-amt">Rs {{ o.totalAmount?.toLocaleString() }}</p>
                <p class="order-date">{{ fmtDate(o.createdAt) }}</p>
              </div>
              <div class="order-badges">
                <span class="badge" :class="statusBadgeClass[o.status] ?? 'badge-gray'">{{ o.status }}</span>
                <span class="badge" :class="payBadgeClass[o.paymentStatus] ?? 'badge-gray'">{{ o.paymentStatus }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Top selling kits (if data available) -->
      <div v-if="stats && stats.topProducts && stats.topProducts.length" class="top-kits-card">
        <h3 class="chart-title" style="margin-bottom:14px">Top Selling Kits</h3>
        <div class="top-list">
          <div v-for="(p, idx) in stats.topProducts" :key="p._id" class="top-item">
            <span class="top-rank" :style="{ background: idx === 0 ? '#ffde59' : idx === 1 ? '#d1d5db' : idx === 2 ? '#fde68a' : '#f3f4f6', color: idx < 3 ? '#545454' : '#94a3b8' }">{{ idx + 1 }}</span>
            <span class="top-name">{{ p.name ?? 'Unknown Project' }}</span>
            <div class="top-bar-wrap">
              <div class="top-bar" :style="{ width: (p.totalSold / (stats.topProducts![0]?.totalSold || 1) * 100) + '%' }"></div>
            </div>
            <span class="top-sold">{{ p.totalSold }} sold</span>
          </div>
        </div>
      </div>

      <!-- No data fallback -->
      <div v-if="!stats" class="no-data">
        <p>Could not load dashboard data. Please refresh or check your backend connection.</p>
      </div>

    </template>
  </div>
</template>

<style scoped>
/* Loading */
.load-wrap    { display:flex; flex-direction:column; align-items:center; justify-content:center; height:300px; gap:14px; color:#94a3b8; font-size:13px; }
.load-spinner { width:32px; height:32px; border:3px solid #f3f4f6; border-top-color:#ffde59; border-radius:50%; animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg) } }

/* Alert */
.reviews-alert { display:flex; align-items:center; gap:10px; background:#fffbeb; border:1px solid #fcd34d; border-radius:10px; padding:10px 16px; font-size:12px; color:#92400e; margin-bottom:16px; }
.alert-link    { margin-left:auto; color:#d97706; font-weight:700; text-decoration:none; font-size:12px; flex-shrink:0; }
.alert-link:hover { text-decoration:underline; }

/* Welcome */
.welcome-row  { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; flex-wrap:wrap; gap:10px; }
.welcome-title { font-size:20px; font-weight:800; color:#545454; }
.welcome-sub   { font-size:12px; color:#94a3b8; margin-top:2px; }
.welcome-date  { font-size:12px; color:#94a3b8; background:#fff; padding:6px 12px; border-radius:8px; border:1px solid #e2e8f0; }

/* KPI */
.kpi-grid  { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:20px; }
@media (max-width:1200px) { .kpi-grid { grid-template-columns:repeat(3,1fr); } }
@media (max-width:700px)  { .kpi-grid { grid-template-columns:repeat(2,1fr); } }

.kpi-card     { background:#fff; border-radius:14px; padding:16px 18px; display:flex; align-items:center; gap:14px; box-shadow:0 1px 3px rgba(0,0,0,.06); border:1px solid #f1f5f9; border-top:3px solid transparent; }
.kpi-icon-wrap { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.kpi-label    { font-size:10px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:.05em; margin-bottom:3px; }
.kpi-value    { font-size:20px; font-weight:800; color:#545454; line-height:1; }

/* Charts */
.charts-row   { display:grid; grid-template-columns:2fr 1fr; gap:16px; margin-bottom:20px; }
@media (max-width:900px) { .charts-row { grid-template-columns:1fr; } }

.chart-card   { background:#fff; border-radius:16px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,.06); border:1px solid #f1f5f9; }
.chart-head   { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; gap:8px; flex-wrap:wrap; }
.chart-title  { font-size:14px; font-weight:700; color:#545454; }
.chart-sub    { font-size:11px; color:#94a3b8; margin-top:2px; }
.chart-badge  { font-size:11px; font-weight:600; background:#f8fafc; border:1px solid #e2e8f0; color:#545454; padding:3px 10px; border-radius:8px; flex-shrink:0; }
.chart-wide   {}

.donut-wrap   { position:relative; display:flex; justify-content:center; align-items:center; }
.donut-center { position:absolute; text-align:center; pointer-events:none; }
.donut-num    { display:block; font-size:26px; font-weight:800; color:#545454; line-height:1; }
.donut-lbl    { display:block; font-size:11px; color:#94a3b8; }

/* Mid row */
.mid-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
@media (max-width:1000px) { .mid-row { grid-template-columns:1fr; } }

/* How it works */
.how-card   { background:#545454; border-radius:16px; padding:22px; color:#fff; }
.how-title  { font-size:14px; font-weight:700; color:#ffde59; margin-bottom:8px; }
.how-sub    { font-size:12px; color:rgba(255,255,255,.6); line-height:1.6; margin-bottom:20px; }
.how-steps  { display:flex; flex-direction:column; gap:0; }
.how-step   { display:flex; gap:12px; }
.step-arrow { font-size:16px; color:rgba(255,255,255,.2); padding-left:13px; line-height:1.2; }
.step-circle { width:26px; height:26px; border-radius:50%; background:#ffde59; color:#545454; font-size:12px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px; }
.step-title { font-size:12px; font-weight:700; color:#ffde59; margin-bottom:3px; }
.step-desc  { font-size:11px; color:rgba(255,255,255,.65); line-height:1.5; padding-bottom:8px; }

.how-stats-row { display:flex; gap:0; margin-top:16px; padding-top:16px; border-top:1px solid rgba(255,255,255,.1); }
.how-stat      { flex:1; text-align:center; }
.hs-val        { display:block; font-size:22px; font-weight:800; color:#ffde59; }
.hs-lbl        { display:block; font-size:10px; color:rgba(255,255,255,.45); margin-top:2px; }

/* Recent orders */
.orders-card  { background:#fff; border-radius:16px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,.06); border:1px solid #f1f5f9; }
.orders-head  { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.see-all-link { font-size:12px; font-weight:600; color:#545454; text-decoration:none; }
.see-all-link:hover { text-decoration:underline; }
.orders-empty { color:#94a3b8; font-size:13px; padding:20px 0; text-align:center; }
.orders-list  { display:flex; flex-direction:column; gap:0; }

.order-item   { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #f8fafc; }
.order-item:last-child { border-bottom:none; }
.order-avatar { width:34px; height:34px; border-radius:50%; background:#ffde59; color:#545454; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.order-info   { flex:1; min-width:0; }
.order-name   { font-size:12px; font-weight:600; color:#545454; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.order-email  { font-size:10px; color:#94a3b8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.order-right  { text-align:right; flex-shrink:0; }
.order-amt    { font-size:13px; font-weight:700; color:#545454; }
.order-date   { font-size:10px; color:#94a3b8; }
.order-badges { display:flex; flex-direction:column; gap:3px; flex-shrink:0; }

/* Top kits */
.top-kits-card { background:#fff; border-radius:16px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,.06); border:1px solid #f1f5f9; margin-bottom:20px; }
.top-list  { display:flex; flex-direction:column; gap:10px; }
.top-item  { display:flex; align-items:center; gap:12px; }
.top-rank  { width:24px; height:24px; border-radius:50%; font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.top-name  { font-size:13px; font-weight:600; color:#545454; min-width:140px; }
.top-bar-wrap { flex:1; height:8px; background:#f3f4f6; border-radius:999px; overflow:hidden; }
.top-bar   { height:100%; background:#ffde59; border-radius:999px; transition:width .4s ease; }
.top-sold  { font-size:12px; font-weight:600; color:#94a3b8; flex-shrink:0; min-width:55px; text-align:right; }

/* Badges */
.badge        { display:inline-block; padding:2px 7px; border-radius:999px; font-size:10px; font-weight:600; white-space:nowrap; }
.badge-green  { background:#dcfce7; color:#166534; }
.badge-red    { background:#fee2e2; color:#991b1b; }
.badge-yellow { background:#fef9c3; color:#854d0e; }
.badge-blue   { background:#dbeafe; color:#1e40af; }
.badge-gray   { background:#f3f4f6; color:#374151; }

/* No data */
.no-data { text-align:center; padding:40px; color:#94a3b8; font-size:14px; background:#fff; border-radius:14px; }

@media (max-width: 480px) {
  .kpi-grid  { grid-template-columns: 1fr 1fr; }
  .order-item { flex-wrap: wrap; }
  .order-badges { width: 100%; flex-direction: row; gap: 6px; padding-top: 4px; }
  .top-name { min-width: 70px; font-size: 12px; }
  .welcome-title { font-size: 16px; }
}
</style>
