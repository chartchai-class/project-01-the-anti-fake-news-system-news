<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, RouterLink } from 'vue-router'
import { uploadProfileImage } from '@/lib/firebaseUpload'

const name = ref('')
const surname = ref('')
const email = ref('')
const password = ref('')
const photoFile = ref(null)

const err = ref('')
const nameErr = ref('')
const surnameErr = ref('')
const emailErr = ref('')
const passwordErr = ref('')

const auth = useAuthStore()
const router = useRouter()
auth.init()

function onPickPhoto(e) {
  const f = e?.target?.files?.[0]
  photoFile.value = f || null
}

async function onSubmit() {
  err.value = ''
  nameErr.value = ''
  surnameErr.value = ''
  emailErr.value = ''
  passwordErr.value = ''

  if (!name.value.trim()) nameErr.value = 'Require First Name'
  if (!surname.value.trim()) surnameErr.value = 'Require Last Name'
  if (!email.value.trim()) emailErr.value = 'Require Email'
  if (!password.value) {
    passwordErr.value = 'Require Password'
  } else if (!/^[0-9]{6,}$/.test(password.value)) {
    passwordErr.value = 'Password must be at least 6 digits and numbers only'
  }

  if (nameErr.value || surnameErr.value || emailErr.value || passwordErr.value) return

  let photoUrl = ''
  
  // Upload profile photo if provided
  if (photoFile.value) {
    try {
      photoUrl = await uploadProfileImage(photoFile.value, email.value.trim())
    } catch (e) {
      console.error('Photo upload failed:', e)
      err.value = 'Photo upload failed. Please try again.'
      return
    }
  }

  try {
    await auth.register({
      name: name.value.trim(),
      surname: surname.value.trim(),
      email: email.value.trim(),
      password: password.value,
      photoUrl
    })
    router.push('/profile')
  } catch (e) {
    err.value = e?.response?.data?.message || 'Register failed'
  }
}
</script>

<template>
  <div class="max-w-md w-full mx-auto bg-white rounded-xl shadow p-6">
    <h1 class="text-3xl font-bold mb-6 text-center">Register</h1>

    <div v-if="err" class="mb-3 text-red-600 text-sm font-semibold text-center">{{ err }}</div>

    <div class="space-y-3">
      <!-- First Name -->
      <label class="block mb-1 text-base font-semibold text-gray-800">First Name</label>
      <input
        v-model="name"
        type="text"
        placeholder="Enter your first name"
        :class="['w-full border rounded px-3 py-2', nameErr ? 'border-red-500' : 'border-gray-300']"
      />
      <p v-if="nameErr" class="text-red-600 text-sm text-left">{{ nameErr }}</p>

      <!-- Last Name -->
      <label class="block mb-1 text-base font-semibold text-gray-800">Last Name</label>
      <input
        v-model="surname"
        type="text"
        placeholder="Enter your last name"
        :class="['w-full border rounded px-3 py-2', surnameErr ? 'border-red-500' : 'border-gray-300']"
      />
      <p v-if="surnameErr" class="text-red-600 text-sm text-left">{{ surnameErr }}</p>

      <!-- Email -->
      <label class="block mb-1 text-base font-semibold text-gray-800">Email</label>
      <input
        v-model="email"
        type="email"
        placeholder="Enter your email"
        :class="['w-full border rounded px-3 py-2', emailErr ? 'border-red-500' : 'border-gray-300']"
      />
      <p v-if="emailErr" class="text-red-600 text-sm text-left">{{ emailErr }}</p>

      <!-- Password -->
      <label class="block mb-1 text-base font-semibold text-gray-800">Password</label>
      <input
        v-model="password"
        type="password"
        placeholder="Enter password"
        :class="['w-full border rounded px-3 py-2', passwordErr ? 'border-red-500' : 'border-gray-300']"
      />
      <p v-if="passwordErr" class="text-red-600 text-sm text-left">{{ passwordErr }}</p>

      <!-- Profile Photo -->
      <label class="block mb-1 text-base font-semibold text-gray-800">Profile Photo (optional)</label>
      <input
        type="file"
        accept="image/*"
        @change="onPickPhoto"
        class="w-full border border-gray-300 rounded px-3 py-2"
      />
      <p class="text-xs text-gray-500">Upload your profile picture</p>
    </div>

    <div class="mt-4">
      <button
        @click="onSubmit"
        class="w-full bg-black text-white rounded py-2 font-semibold hover:bg-gray-800"
      >
        Create account
      </button>

      <div class="text-sm text-gray-600 text-center mt-4">
        Already have an account?
        <RouterLink to="/login" class="underline">Log In</RouterLink>
      </div>
    </div>
  </div>
</template>