<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { shopAuthAPI, shopAPI } from '@/api/index'
import { shopAuth } from '@/stores/shopAuth'

const router = useRouter()
const route  = useRoute()

const tab = ref<'login'|'register'>(route.query.tab === 'register' ? 'register' : 'login')
const loading = ref(false)
const error   = ref('')

const loginEmail = ref('')
const loginPass  = ref('')

const regName   = ref('')
const regEmail  = ref('')
const regPass   = ref('')
const regPass2  = ref('')

onMounted(() => {
  if (shopAuth.isLoggedIn) router.replace(String(route.query.redirect ?? '/'))
})

async function doLogin() {
  error.value = ''
  if (!loginEmail.value || !loginPass.value) { error.value = 'Please fill in all fields.'; return }
  loading.value = true
  try {
    const res = await shopAuthAPI.login({ email: loginEmail.value, password: loginPass.value })
    shopAuth.setAuth(res.data.token, res.data.data)
    const me = await shopAPI.getMe()
    shopAuth.setCustomer(me.data.data)
    router.push(String(route.query.redirect ?? '/'))
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Login failed. Check your credentials.'
  } finally { loading.value = false }
}

async function doRegister() {
  error.value = ''
  if (!regName.value || !regEmail.value || !regPass.value) { error.value = 'Please fill in all fields.'; return }
  if (regPass.value !== regPass2.value) { error.value = 'Passwords do not match.'; return }
  if (regPass.value.length < 6) { error.value = 'Password must be at least 6 characters.'; return }
  loading.value = true
  try {
    const res = await shopAuthAPI.register({ name: regName.value, email: regEmail.value, password: regPass.value })
    shopAuth.setAuth(res.data.token, res.data.data)
    const me = await shopAPI.getMe()
    shopAuth.setCustomer(me.data.data)
    router.push(String(route.query.redirect ?? '/'))
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Registration failed. Please try again.'
  } finally { loading.value = false }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">

      <!-- Brand -->
      <div class="auth-brand">
        <div class="brand-logo">F</div>
        <p class="brand-name">Fris-b</p>
      </div>

      <!-- Tabs -->
      <div class="auth-tabs">
        <button class="auth-tab" :class="{ 'auth-tab--active': tab === 'login' }" @click="tab = 'login'; error = ''">Sign In</button>
        <button class="auth-tab" :class="{ 'auth-tab--active': tab === 'register' }" @click="tab = 'register'; error = ''">Create Account</button>
      </div>

      <!-- Error -->
      <div v-if="error" class="auth-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ error }}
      </div>

      <!-- Login form -->
      <form v-if="tab === 'login'" @submit.prevent="doLogin" class="auth-form">
        <div class="field">
          <label class="field-lbl">Email</label>
          <input v-model="loginEmail" type="email" class="field-inp" placeholder="your@email.com" autocomplete="email" required />
        </div>
        <div class="field">
          <label class="field-lbl">Password</label>
          <input v-model="loginPass" type="password" class="field-inp" placeholder="••••••••" autocomplete="current-password" required />
        </div>
        <button type="submit" class="btn-auth" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
        <p class="auth-switch">
          Don't have an account?
          <button type="button" class="switch-link" @click="tab = 'register'; error = ''">Create one</button>
        </p>
      </form>

      <!-- Register form -->
      <form v-else @submit.prevent="doRegister" class="auth-form">
        <div class="field">
          <label class="field-lbl">Full Name</label>
          <input v-model="regName" type="text" class="field-inp" placeholder="Ali Hassan" autocomplete="name" required />
        </div>
        <div class="field">
          <label class="field-lbl">Email</label>
          <input v-model="regEmail" type="email" class="field-inp" placeholder="your@email.com" autocomplete="email" required />
        </div>
        <div class="field">
          <label class="field-lbl">Password</label>
          <input v-model="regPass" type="password" class="field-inp" placeholder="At least 6 characters" autocomplete="new-password" required />
        </div>
        <div class="field">
          <label class="field-lbl">Confirm Password</label>
          <input v-model="regPass2" type="password" class="field-inp" placeholder="Repeat password" autocomplete="new-password" required />
        </div>
        <button type="submit" class="btn-auth" :disabled="loading">
          {{ loading ? 'Creating Account…' : 'Create Account' }}
        </button>
        <p class="auth-switch">
          Already have an account?
          <button type="button" class="switch-link" @click="tab = 'login'; error = ''">Sign in</button>
        </p>
      </form>

    </div>
  </div>
</template>

<style scoped>
.auth-page { min-height: calc(100vh - 64px); background: #fafafa; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
.auth-card { background: #fff; border-radius: 20px; border: 1px solid #f1f5f9; padding: 40px; width: 100%; max-width: 420px; box-shadow: 0 4px 24px rgba(0,0,0,.07); }
.auth-brand { text-align: center; margin-bottom: 24px; }
.brand-logo { width: 52px; height: 52px; border-radius: 14px; background: #545454; color: #ffde59; font-size: 22px; font-weight: 900; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
.brand-name { font-size: 20px; font-weight: 800; color: #545454; }
.auth-tabs  { display: flex; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
.auth-tab   { flex: 1; padding: 10px; font-size: 13px; font-weight: 600; color: #94a3b8; border: none; background: transparent; cursor: pointer; transition: all .15s; }
.auth-tab--active { background: #545454; color: #ffde59; }
.auth-error { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #fee2e2; border-radius: 10px; font-size: 12px; color: #dc2626; margin-bottom: 16px; }
.auth-form  { display: flex; flex-direction: column; gap: 14px; }
.field      { display: flex; flex-direction: column; gap: 5px; }
.field-lbl  { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .04em; }
.field-inp  { padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #545454; outline: none; transition: border-color .15s; }
.field-inp:focus { border-color: #ffde59; }
.btn-auth   { padding: 13px; border-radius: 12px; background: #ffde59; color: #545454; font-size: 15px; font-weight: 800; border: none; cursor: pointer; margin-top: 6px; transition: transform .15s, box-shadow .15s; box-shadow: 0 4px 16px rgba(255,222,89,.35); }
.btn-auth:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,222,89,.5); }
.btn-auth:disabled { opacity: .6; cursor: not-allowed; }
.auth-switch { text-align: center; font-size: 12px; color: #94a3b8; }
.switch-link { background: none; border: none; font-size: 12px; color: #545454; font-weight: 700; cursor: pointer; text-decoration: underline; }
</style>
