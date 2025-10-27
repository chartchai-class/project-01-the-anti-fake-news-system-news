<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter, RouterLink } from 'vue-router'
import { computed } from 'vue'

const auth = useAuthStore()
const router = useRouter()
auth.init()

const u = computed(() => auth.currentUser)

function logout() { auth.logout(); router.push('/login') }
function readNotifications() { auth.markNotificationsRead() }
function applyMembership() { auth.applyForMembership(); alert('Application submitted (demo).') }
</script>

<template>
  <div>
    <div v-if="u" class="max-w-3xl w-full mx-auto bg-white rounded-xl shadow p-6">
      <div class="flex items-center gap-4">
        <img v-if="u.photoUrl" :src="u.photoUrl" alt="profile" class="h-16 w-16 rounded-lg object-cover border" />
        <div v-else class="h-16 w-16 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xl font-bold">
          {{ (u.name?.[0] || 'U') + (u.surname?.[0] || '') }}
        </div>
        <div>
          <div class="text-xl font-bold">{{ u.name }} {{ u.surname }}</div>
          <div class="text-sm text-gray-600">{{ u.email }}</div>
          <div class="text-sm mt-1">Membership: <span class="font-semibold capitalize">{{ u.membership }}</span></div>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <button @click="readNotifications" class="px-3 py-2 rounded border">
          Mark notifications read
        </button>
        <button @click="applyMembership" class="px-3 py-2 rounded border">
          Apply for membership
        </button>
        <RouterLink to="/" class="px-3 py-2 rounded border no-underline text-inherit">
          Back to Home
        </RouterLink>
        <button @click="logout" class="ml-auto px-3 py-2 rounded border bg-black text-white">
          Logout
        </button>
      </div>
    </div>

    <div v-else class="max-w-2xl w-full mx-auto bg-white rounded-xl shadow p-6">
      <p class="mb-3">You are not logged in.</p>
      <RouterLink to="/login" class="underline">Go to Login</RouterLink>
    </div>
  </div>  

  <div class="mt-8 ml-[50px]">
    <RouterLink to="/"class="flex items-center justify-center w-[150px] h-[40px] bg-white text-black border border-gray-400 rounded hover:bg-gray-100 transition">
      Back to home
    </RouterLink>
  </div>

</template>
