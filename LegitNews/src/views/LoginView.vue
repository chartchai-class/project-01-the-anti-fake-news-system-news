<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, RouterLink } from 'vue-router'

const email = ref('')
const password = ref('')
const err = ref('')

const auth = useAuthStore()
const router = useRouter()
auth.init()

async function onSubmit() {
  err.value = ''
  try {
    await auth.login({ email: email.value.trim(), password: password.value })
    router.push('/profile')
  } catch (e) {
    err.value = e?.response?.data?.message || e.message || 'Login failed'
  }
}

</script>

<template>
  <div class="max-w-md w-full mx-auto bg-white rounded-xl shadow p-6">
    <h1 class="text-3xl font-bold mb-6 text-center">Login</h1>
    <div v-if="err" class="mb-3 text-red-600 text-sm">{{ err }}</div>

    <div class="space-y-3">
      <label class="block mb-2 text-base font-semibold text-gray-800">Email</label>
      <input v-model="email" type="email" placeholder="Enter your email"
             class="w-full border border-gray-300 rounded px-3 py-2"/>

      <label class="block mb-2 text-base font-semibold text-gray-800">Password</label>
      <input v-model="password" type="password" placeholder="Enter your password"
             class="w-full border border-gray-300 rounded px-3 py-2"/>      
    </div>

    <div class="mt-4">
      <button @click="onSubmit" class="w-full bg-black text-white rounded py-2 font-semibold hover:bg-gray-800">
        Sign in
      </button>
      <div class="text-sm text-gray-600 text-center mt-4">
        Don't have an account? <RouterLink to="/register" class="underline">Create One</RouterLink>
      </div>
    </div>
    

  </div>
</template>
