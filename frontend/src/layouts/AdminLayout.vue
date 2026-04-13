<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'

const router = useRouter()
const sidebarOpen = ref(false)

const navItems = [
  { label: 'Dashboard',   name: 'dashboard',  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Projects',    name: 'products',   icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Categories',  name: 'categories', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { label: 'Tags',        name: 'tags',       icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
  { label: 'Components',  name: 'components', icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18' },
  { label: 'Orders',      name: 'orders',     icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { label: 'Customers',   name: 'customers',  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'Coupons',     name: 'coupons',    icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
  { label: 'Banners',     name: 'banners',    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Reviews',     name: 'reviews',    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
]

function logout() {
  authStore.clearAuth()
  router.push('/admin/login')
}
</script>

<template>
  <div class="admin-shell">

    <!-- Mobile overlay -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">

      <!-- Brand -->
      <div class="sidebar-brand">
        <div class="brand-logo">F</div>
        <div>
          <p class="brand-name">Fris-b</p>
          <p class="brand-sub">Admin Panel</p>
        </div>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <p class="nav-section-label">MENU</p>
        <router-link
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="nav-link"
          :class="{ 'nav-link--active': $route.name === item.name }"
          @click="sidebarOpen = false"
        >
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path :d="item.icon" />
          </svg>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- User -->
      <div class="sidebar-footer">
        <div class="user-row">
          <div class="user-avatar">{{ (authStore.user?.name ?? 'A').charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <p class="user-name">{{ authStore.user?.name ?? 'Admin' }}</p>
            <p class="user-email">{{ authStore.user?.email }}</p>
          </div>
        </div>
        <button @click="logout" class="logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="main-wrap">
      <header class="topbar">
        <button class="hamburger-btn" @click="sidebarOpen = !sidebarOpen" aria-label="Toggle menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <h1 class="topbar-title">{{ String($route.name ?? '').replace(/-/g, ' ') }}</h1>
        <div class="topbar-right">
          <span class="topbar-date">{{ new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }}</span>
        </div>
      </header>
      <main class="page-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell { display: flex; height: 100vh; overflow: hidden; background: #f4f5f7; }

/* ── Sidebar ── */
.sidebar {
  width: 230px; flex-shrink: 0; display: flex; flex-direction: column;
  background: #545454; overflow-y: auto;
}
.sidebar-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 20px 16px 18px; border-bottom: 1px solid rgba(255,255,255,0.07);
}
.brand-logo {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: #ffde59; color: #545454; font-weight: 800; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
}
.brand-name { color: #fff; font-weight: 700; font-size: 15px; line-height: 1.2; }
.brand-sub  { color: rgba(255,255,255,0.35); font-size: 10px; letter-spacing: 0.05em; }

.sidebar-nav { flex: 1; padding: 16px 10px; }
.nav-section-label {
  color: rgba(255,255,255,0.25); font-size: 9px; font-weight: 700;
  letter-spacing: 0.1em; padding: 0 8px; margin-bottom: 6px;
}
.nav-link {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 10px; border-radius: 8px; margin-bottom: 2px;
  color: rgba(255,255,255,0.55); font-size: 13px; font-weight: 500;
  text-decoration: none; transition: all 0.15s;
}
.nav-link:hover { color: #fff; background: rgba(255,255,255,0.08); }
.nav-link--active { background: #ffde59 !important; color: #545454 !important; font-weight: 700; }
.nav-icon { width: 16px; height: 16px; flex-shrink: 0; }

.sidebar-footer {
  padding: 12px 14px 16px; border-top: 1px solid rgba(255,255,255,0.07);
}
.user-row { display: flex; align-items: center; gap: 9px; margin-bottom: 10px; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%; background: #ffde59;
  color: #545454; font-weight: 700; font-size: 13px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.user-name  { color: #fff; font-size: 12px; font-weight: 600; line-height: 1.2; }
.user-email { color: rgba(255,255,255,0.35); font-size: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px; }
.logout-btn {
  display: flex; align-items: center; gap: 6px; width: 100%;
  padding: 7px 10px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.12);
  background: transparent; color: rgba(255,255,255,0.5); font-size: 12px;
  cursor: pointer; transition: all 0.15s;
}
.logout-btn:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); color: #f87171; }

/* ── Main ── */
.main-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; height: 56px; background: #fff; border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.topbar-title {
  font-size: 16px; font-weight: 700; color: #1e293b; text-transform: capitalize;
}
.topbar-right { display: flex; align-items: center; gap: 12px; }
.topbar-date { font-size: 12px; color: #94a3b8; }
.page-main { flex: 1; overflow-y: auto; padding: 24px; }

/* ── Mobile responsive ── */
.hamburger-btn {
  display: none;
  align-items: center; justify-content: center;
  width: 36px; height: 36px; flex-shrink: 0;
  border: none; background: transparent; cursor: pointer;
  border-radius: 8px; color: #1e293b; margin-right: 4px;
}
.hamburger-btn:hover { background: #f1f5f9; }
.sidebar-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 49;
}
@media (max-width: 767px) {
  .admin-shell { display: flex; flex-direction: column; height: auto; min-height: 100vh; overflow: visible; }
  .sidebar {
    position: fixed; left: 0; top: 0; height: 100vh; z-index: 50;
    transform: translateX(-100%); transition: transform 0.25s ease;
    box-shadow: 4px 0 20px rgba(0,0,0,0.15);
  }
  .sidebar--open { transform: translateX(0); }
  .main-wrap { flex: 1; overflow: visible; min-height: 0; }
  .page-main { overflow: visible; padding: 16px 12px; }
  .hamburger-btn { display: flex; }
}
</style>
  