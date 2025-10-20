<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const name = ref('')
const surname = ref('')
const email = ref('')
const password = ref('')
const photoUrl = ref('')
const err = ref('')

const auth = useAuthStore()
const router = useRouter()
auth.init()

function onSubmit() {
  err.value = ''
  try {
    auth.register({
      name: name.value.trim(),
      surname: surname.value.trim(),
      email: email.value.trim(),
      password: password.value,
      photoUrl: photoUrl.value.trim()
    })
    router.push('/profile')
  } catch (e) {
    err.value = e.message || 'Register failed'
  }
}
</script>

<template>
  <div class="max-w-md w-full mx-auto bg-white rounded-xl shadow p-6">
    <h1 class="text-xl font-bold mb-4">Register</h1>
    <div v-if="err" class="mb-3 text-red-600 text-sm">{{ err }}</div>

    <div class="space-y-3">
      <input v-model="name" type="text" placeholder="Name" class="w-full border border-gray-300 rounded px-3 py-2" />
      <input v-model="surname" type="text" placeholder="Surname" class="w-full border border-gray-300 rounded px-3 py-2" />
      <input v-model="email" type="email" placeholder="Email" class="w-full border border-gray-300 rounded px-3 py-2" />
      <input v-model="password" type="password" placeholder="Password" class="w-full border border-gray-300 rounded px-3 py-2" />
      <input v-model="photoUrl" type="url" placeholder="Photo URL (optional)" class="w-full border border-gray-300 rounded px-3 py-2" />

      <button @click="onSubmit" class="w-full bg-black text-white rounded py-2 font-semibold hover:bg-gray-800">
        Create account
      </button>
    </div>
  </div>
</template>
