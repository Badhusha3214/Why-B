<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { cart } from '@/stores/cart'
import { shopAuth } from '@/stores/shopAuth'

const router  = useRouter()
const mobileMenu = ref(false)
const userMenu   = ref(false)

const itemCount = computed(() => cart.itemCount.value)

function logout() {
  shopAuth.clearAuth()
  cart.clear()
  router.push('/login')
  userMenu.value = false
}
</script>

<template>
  <div class="shop-shell">

    <!-- ── Top bar ── -->
    <header class="shop-header">
      <div class="header-inner">

        <!-- Logo -->
        <router-link to="/" class="logo-wrap">
          <div class="logo-mark">F</div>
          <span class="logo-text">Fris<span class="logo-accent">-b</span></span>
        </router-link>

        <!-- Nav (desktop) -->
        <nav class="desk-nav">
          <router-link to="/"        class="nav-a" active-class="nav-a--on" exact>Home</router-link>
          <router-link to="/shop"    class="nav-a" active-class="nav-a--on">Shop</router-link>
          <router-link to="/about"   class="nav-a" active-class="nav-a--on">About</router-link>
          <router-link to="/contact" class="nav-a" active-class="nav-a--on">Contact</router-link>
        </nav>

        <!-- Right actions -->
        <div class="header-actions">
          <!-- Cart (only when signed in) -->
          <router-link v-if="shopAuth.isLoggedIn" to="/cart" class="cart-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <span v-if="itemCount > 0" class="cart-badge">{{ itemCount }}</span>
          </router-link>

          <!-- Auth -->
          <div v-if="shopAuth.isLoggedIn" class="user-trigger" @click="userMenu = !userMenu">
            <div class="user-avatar-sm">{{ (shopAuth.user?.name ?? 'U').charAt(0).toUpperCase() }}</div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><polyline points="6 9 12 15 18 9"/></svg>

            <div v-if="userMenu" class="user-dropdown" @click.stop>
              <div class="dropdown-user">
                <p class="du-name">{{ shopAuth.user?.name }}</p>
                <p class="du-email">{{ shopAuth.user?.email }}</p>
              </div>
              <router-link to="/account" class="dropdown-item" @click="userMenu = false">My Account</router-link>
              <router-link to="/account?tab=orders" class="dropdown-item" @click="userMenu = false">My Orders</router-link>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item dropdown-logout" @click="logout">Sign Out</button>
            </div>
          </div>
          <router-link v-else to="/login" class="btn-login-sm">Sign In</router-link>

          <!-- Hamburger -->
          <button class="ham-btn" @click="mobileMenu = !mobileMenu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
              <line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile nav -->
      <nav v-if="mobileMenu" class="mobile-nav" @click="mobileMenu = false">
        <router-link to="/"        class="mob-link" active-class="mob-link--on" exact>Home</router-link>
        <router-link to="/shop"    class="mob-link" active-class="mob-link--on">Shop</router-link>
        <router-link to="/about"   class="mob-link" active-class="mob-link--on">About</router-link>
        <router-link to="/contact" class="mob-link" active-class="mob-link--on">Contact</router-link>
        <router-link v-if="shopAuth.isLoggedIn" to="/account" class="mob-link">My Account</router-link>
        <button v-if="shopAuth.isLoggedIn" class="mob-logout" @click="logout">Sign Out</button>
        <router-link v-else to="/login" class="mob-link">Sign In / Register</router-link>
      </nav>
    </header>

    <!-- ── Page content ── -->
    <main class="shop-main">
      <router-view />
    </main>

    <!-- ── Footer ── -->
    <footer class="shop-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="logo-mark" style="width:32px;height:32px;font-size:16px">F</div>
          <div>
            <p class="footer-logo-text">Fris-b</p>
            <p class="footer-tag">Learn. Build. Create.</p>
          </div>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <p class="footer-col-title">Shop</p>
            <router-link to="/shop" class="footer-link">All Kits</router-link>
            <router-link to="/shop?featured=true" class="footer-link">Featured</router-link>
          </div>
          <div class="footer-col">
            <p class="footer-col-title">Account</p>
            <router-link to="/account" class="footer-link">My Orders</router-link>
            <router-link to="/account?tab=addresses" class="footer-link">Addresses</router-link>
          </div>
          <div class="footer-col">
            <p class="footer-col-title">Info</p>
            <router-link to="/about" class="footer-link">About</router-link>
            <router-link to="/contact" class="footer-link">Contact</router-link>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© {{ new Date().getFullYear() }} Fris-b. All rights reserved.</p>
      </div>
    </footer>

    <!-- backdrop for user dropdown -->
    <div v-if="userMenu" class="dropdown-backdrop" @click="userMenu = false"></div>

  </div>
</template>

<style scoped>
/* Shell */
.shop-shell { min-height: 100vh; display: flex; flex-direction: column; background: #fff; font-family: system-ui, -apple-system, sans-serif; }
.shop-main  { flex: 1; }

/* Header */
.shop-header { position: sticky; top: 0; z-index: 40; background: #fff; border-bottom: 1px solid #f1f1f1; }
.header-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; gap: 32px; }

/* Logo */
.logo-wrap  { display: flex; align-items: center; gap: 9px; text-decoration: none; flex-shrink: 0; }
.logo-mark  { width: 38px; height: 38px; border-radius: 10px; background: #545454; color: #ffde59; font-weight: 900; font-size: 20px; display: flex; align-items: center; justify-content: center; }
.logo-text  { font-size: 20px; font-weight: 800; color: #545454; letter-spacing: -0.5px; }
.logo-accent{ color: #ffde59; }

/* Desktop nav */
.desk-nav { display: flex; align-items: center; gap: 4px; flex: 1; }
.nav-a { padding: 6px 12px; border-radius: 8px; font-size: 14px; font-weight: 500; color: #64748b; text-decoration: none; transition: all .15s; }
.nav-a:hover  { color: #545454; background: #f8f9fa; }
.nav-a--on    { color: #545454; font-weight: 700; }

/* Actions */
.header-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.cart-btn { position: relative; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #545454; background: #f8f9fa; border: none; cursor: pointer; text-decoration: none; transition: background .15s; }
.cart-btn:hover { background: #f0f0f0; }
.cart-badge { position: absolute; top: 5px; right: 5px; width: 16px; height: 16px; border-radius: 50%; background: #ffde59; color: #545454; font-size: 9px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }

/* User dropdown */
.user-trigger { position: relative; display: flex; align-items: center; gap: 5px; padding: 6px 10px; border-radius: 10px; cursor: pointer; background: #f8f9fa; transition: background .15s; user-select: none; }
.user-trigger:hover { background: #f0f0f0; }
.user-avatar-sm { width: 28px; height: 28px; border-radius: 50%; background: #545454; color: #ffde59; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.user-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 10px 40px rgba(0,0,0,.12); min-width: 200px; overflow: hidden; z-index: 99; }
.dropdown-user { padding: 14px 16px 10px; border-bottom: 1px solid #f1f5f9; }
.du-name  { font-size: 13px; font-weight: 700; color: #545454; }
.du-email { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.dropdown-item { display: block; width: 100%; padding: 10px 16px; font-size: 13px; color: #475569; text-decoration: none; background: none; border: none; cursor: pointer; text-align: left; transition: background .12s; }
.dropdown-item:hover { background: #f8f9fa; }
.dropdown-divider { height: 1px; background: #f1f5f9; }
.dropdown-logout { color: #ef4444 !important; }
.dropdown-backdrop { position: fixed; inset: 0; z-index: 38; }

/* Login btn */
.btn-login-sm { padding: 7px 16px; border-radius: 9px; background: #545454; color: #ffde59; font-size: 13px; font-weight: 700; text-decoration: none; transition: opacity .15s; }
.btn-login-sm:hover { opacity: .85; }

/* Hamburger */
.ham-btn { display: none; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 10px; border: none; background: #f8f9fa; cursor: pointer; color: #545454; }
.ham-btn:hover { background: #f0f0f0; }

/* Mobile nav */
.mobile-nav { border-top: 1px solid #f1f5f9; padding: 12px 24px; display: flex; flex-direction: column; gap: 2px; }
.mob-link  { padding: 10px 12px; border-radius: 8px; font-size: 14px; color: #545454; text-decoration: none; display: block; font-weight: 500; }
.mob-link:hover, .mob-link--on { background: #f8f9fa; }
.mob-logout { width: 100%; text-align: left; padding: 10px 12px; border: none; background: none; color: #ef4444; font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 8px; }
.mob-logout:hover { background: #fef2f2; }

/* Footer */
.shop-footer  { background: #545454; color: #fff; }
.footer-inner { max-width: 1200px; margin: 0 auto; padding: 48px 24px 32px; display: grid; grid-template-columns: auto 1fr; gap: 48px; }
.footer-brand { display: flex; align-items: flex-start; gap: 12px; }
.footer-logo-text { font-size: 18px; font-weight: 800; color: #fff; }
.footer-tag   { font-size: 12px; color: rgba(255,255,255,.4); margin-top: 3px; }
.footer-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; justify-self: end; }
.footer-col-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #ffde59; margin-bottom: 10px; }
.footer-link  { display: block; font-size: 13px; color: rgba(255,255,255,.55); text-decoration: none; margin-bottom: 7px; transition: color .15s; }
.footer-link:hover { color: #fff; }
.footer-bottom { border-top: 1px solid rgba(255,255,255,.1); padding: 16px 20px; text-align: center; font-size: 12px; color: rgba(255,255,255,.3); }

@media (max-width: 767px) {
  .desk-nav { display: none; }
  .ham-btn  { display: flex; }
  .footer-inner { grid-template-columns: 1fr; gap: 32px; }
  .footer-links { grid-template-columns: repeat(2, 1fr); }
}
</style>
