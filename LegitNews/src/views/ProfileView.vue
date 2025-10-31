<script setup>
import { computed, ref, onMounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { uploadProfileImage } from '@/lib/firebaseUpload'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
const api = axios.create({ baseURL: `${API_BASE}/api` })

const auth = useAuthStore()
const router = useRouter()
const isLoading = ref(true)
const user = computed(() => auth.currentUser)
const userNews = ref([])
const isUploadingPhoto = ref(false)

const role = computed(() => (user.value?.role || '').toLowerCase())
const isAdmin = computed(() => role.value === 'admin')
const membershipBtnText = computed(() =>
  isAdmin.value ? 'View Membership Requests' : 'Apply Membership'
)

onMounted(async () => {
  await auth.init()
  isLoading.value = false
  
  if (user.value?.id) {
    try {
      const res = await api.get(`/users/${user.value.id}/news`)
      userNews.value = res.data
    } catch (e) {
      console.error('Failed to fetch user news:', e)
    }
  }
})

function applyMembership() {
  if (!user.value) return
  if (role.value === 'member') {
    alert('You are already a member!')
    return
  }
  auth.applyForMembership?.()
}

// Unified click handler (minimal change: fixed route target)
function handleMembershipClick() {
  if (isAdmin.value) {
    router.push({ name: 'admin-manage-user', query: { tab: 'pending' } })
    return
  }
  applyMembership()
}

function logout() {
  auth.logout()
  router.push('/login')
}

function getRoleClass(roleInput) {
  if (!roleInput) return 'bg-gray-100 text-gray-700'
  const r = roleInput.toLowerCase()
  if (r === 'admin') return 'bg-purple-100 text-purple-800'
  if (r === 'member') return 'bg-blue-100 text-blue-800'
  return 'bg-gray-100 text-gray-700'
}

async function onClickProfilePhoto() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  
  input.onchange = async (e) => {
    const file = e.target?.files?.[0]
    if (!file) return
    
    isUploadingPhoto.value = true
    try {
      const photoUrl = await uploadProfileImage(file, user.value.email)
      await api.put(`/users/${user.value.id}/photo`, null, { params: { photoUrl } })
      auth.currentUser.photoUrl = photoUrl
      auth._save()
      alert('✅ Profile photo updated successfully!')
    } catch (e) {
      console.error('Photo upload failed:', e)
      alert('Failed to upload photo. Please try again.')
    } finally {
      isUploadingPhoto.value = false
    }
  }
  
  input.click()
}
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-4 py-6">
    <!-- Profile Card -->
    <div v-if="!isLoading && user" class="bg-white rounded-xl shadow p-6 mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-6">
          <!-- Clickable Profile Photo -->
          <div 
            @click="onClickProfilePhoto"
            class="relative cursor-pointer group"
            :class="isUploadingPhoto ? 'opacity-50 pointer-events-none' : ''"
          >
            <img
              v-if="user.photoUrl"
              :src="user.photoUrl"
              alt="profile"
              class="h-32 w-32 rounded-lg object-cover border group-hover:opacity-75 transition"
            />
            <div
              v-else
              class="h-32 w-32 rounded-lg bg-gray-900 text-white flex items-center justify-center text-4xl font-bold group-hover:bg-gray-700 transition"
            >
              {{ (user.name?.[0] || 'U') + (user.surname?.[0] || '') }}
            </div>
            
            <!-- Upload overlay -->
            <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition">
              <span class="text-white opacity-0 group-hover:opacity-100 text-sm font-semibold">
                {{ isUploadingPhoto ? 'Uploading...' : 'Change Photo' }}
              </span>
            </div>
          </div>
          
          <div>
            <div class="text-3xl font-bold">{{ user.name }} {{ user.surname }}</div>
            <div class="text-lg text-gray-600 mt-1">Email: {{ user.email }}</div>
            <div class="text-lg mt-2">
              Status:
              <span
                :class="[getRoleClass(user.role), 'ml-2 px-4 py-1 inline-flex text-sm leading-6 font-semibold rounded-full capitalize']"
              >
                {{ user.role || 'Reader' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap justify-between mt-6">
        <div class="flex gap-3">
          <RouterLink
            to="/"
            class="px-4 py-2 rounded border border-gray-400 bg-white hover:bg-gray-100 transition"
          >
            Back to Home
          </RouterLink>

          <button
            @click="handleMembershipClick"
            class="px-4 py-2 rounded border border-gray-400 bg-white hover:bg-gray-100 transition"
          >
            {{ membershipBtnText }}
          </button>
        </div>

        <div>
          <button
            @click="logout"
            class="px-4 py-2 rounded border border-black bg-black text-white hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="!isLoading && !user" class="bg-white rounded-xl shadow p-6 text-center">
      <p class="mb-3 text-lg">You are not logged in.</p>
      <RouterLink to="/login" class="text-lg underline hover:text-blue-600 transition">
        Login to your account
      </RouterLink>
    </div>

    <!-- User's News Section -->
    <div v-if="!isLoading && user" class="mt-8">
      <h2 class="text-2xl font-bold mb-4 px-6">My Uploaded News ({{ userNews.length }})</h2>
      
      <div v-if="userNews.length === 0" class="text-center text-gray-500 py-8 bg-white rounded-xl shadow p-6">
        <p class="text-lg mb-2">You haven't uploaded any news yet.</p>
        <RouterLink to="/add-news" class="text-blue-600 underline mt-2 inline-block hover:text-blue-800">
          Upload your first news →
        </RouterLink>
      </div>
      
      <div v-else class="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
        <RouterLink
          v-for="news in userNews"
          :key="news.id"
          :to="`/news/${news.id}`"
          class="no-underline text-inherit"
        >
          <div class="w-full bg-white rounded-lg shadow-md overflow-hidden relative hover:shadow-lg transition">
            <div class="h-[150px] overflow-hidden">
              <img 
                :src="news.imagePublicUrl || news.imageUrl || 'https://via.placeholder.com/300x150'" 
                alt="news image" 
                class="w-full h-full object-cover" 
              />
            </div>

            <span
              class="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white"
              :class="news.votesReal > news.votesFake ? 'bg-green-600' : 'bg-red-500'"
            >
              {{ news.votesReal > news.votesFake ? 'Verified' : 'Fake' }}
            </span>

            <div class="p-3">
              <div class="text-xs text-gray-500 mb-1">{{ news.category }}</div>
              <div class="font-bold my-1">{{ news.headline }}</div>
              <p class="text-sm text-gray-600">{{ news.details?.substring(0, 80) }}...</p>

              <div class="flex justify-between text-[13px] text-gray-600 mt-2">
                <div>Reporter: {{ news.reporter }}</div>
                <div>{{ news.dateTime ? new Date(news.dateTime).toLocaleDateString() : '' }}</div>
              </div>

              <div class="flex gap-2 mt-2 text-xs">
                <span class="bg-green-100 text-green-700 px-2 py-1 rounded">
                  👍 {{ news.votesReal }} Real
                </span>
                <span class="bg-red-100 text-red-700 px-2 py-1 rounded">
                  👎 {{ news.votesFake }} Fake
                </span>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
