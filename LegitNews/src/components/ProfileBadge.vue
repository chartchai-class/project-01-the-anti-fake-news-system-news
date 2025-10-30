<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'

const router = useRouter()
const auth = useAuthStore()

const isLoggedIn = computed(() => auth.isLoggedIn)
const initials = computed(() => {
  if (!auth.currentUser) return 'LN'
  const n = (auth.currentUser.name || '').charAt(0) || 'U'
  const s = (auth.currentUser.surname || '').charAt(0) || ''
  return (n + s).toUpperCase()
})
const unread = computed(() => auth.unreadCount)
const photoUrl = computed(() => auth.currentUser?.photoUrl)

function go() { router.push(isLoggedIn.value ? '/profile' : '/login') }
</script>

<template>
  <button @click="go"
    class="relative flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg border border-gray-300 hover:border-gray-500 bg-white transition"
    aria-label="Profile or Login"
  >
    <div class="relative h-8 w-8 rounded-md overflow-hidden flex items-center justify-center text-sm font-bold">
      <template v-if="isLoggedIn">
        <!-- Show photo if available -->
        <img 
          v-if="photoUrl" 
          :src="photoUrl" 
          alt="profile"
          class="h-full w-full object-cover"
        />
        <!-- Otherwise show initials -->
        <div 
          v-else
          class="h-full w-full bg-gray-900 text-white flex items-center justify-center"
        >
          <span>{{ initials }}</span>
        </div>
      </template>

      <template v-else>
        <div class="h-full w-full bg-gray-900 text-white flex items-center justify-center">
          <i class="bi bi-box-arrow-in-right text-lg"></i>
        </div>
      </template>

      <span v-if="unread > 0"
        class="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">
        {{ unread }}
      </span>
    </div>

    <span class="text-sm font-semibold hidden sm:inline">
      {{ isLoggedIn ? (auth.currentUser.name || 'Profile') : 'Login' }}
    </span>
  </button>
</template>

<style scoped>
.min-w-5 { min-width: 1.25rem; }
</style>