<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/api/index'
import { authStore } from '@/stores/auth'

const router = useRouter()
const email    = ref('admin@Fris-b.com')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

async function login() {
  error.value   = ''
  loading.value = true
  try {
    const res = await authAPI.adminLogin({ email: email.value, password: password.value })
    authStore.setAuth(res.data.token, res.data.data.user)
    router.push('/admin')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center" style="background:#545454">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold" style="color:#545454">Fris-b</h1>
        <p class="text-gray-500 text-sm mt-1">Admin Panel</p>
      </div>

      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style="--tw-ring-color:#ffde59"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style="--tw-ring-color:#ffde59"
          />
        </div>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 rounded-lg font-semibold text-sm transition-opacity"
          style="background:#ffde59; color:#545454"
          :style="loading ? 'opacity:0.6' : ''"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>
