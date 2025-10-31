<script setup>
import { ref, computed } from "vue" 
import { RouterLink, useRouter } from "vue-router"
import 'bootstrap-icons/font/bootstrap-icons.css'
import ProfileBadge from '@/components/ProfileBadge.vue'
import { useAuthStore } from '@/stores/authStore'
import { onMounted } from 'vue'
import axios from 'axios'

const auth = useAuthStore() 
auth.init()

const isOpen = ref(false)
const searchTerm = ref("")
const router = useRouter()

const commentCount = ref(0);
const userRequestCount = ref(0);

function handleSearch() {
  if (searchTerm.value.trim()) {
    router.push(`/search/${encodeURIComponent(searchTerm.value.trim())}`)
    searchTerm.value = ""
    isOpen.value = false
  }
}

async function fetchNotificationCounts() {
  try {
    // Fetch reported comments count
    const commentsRes = await axios.get(`${import.meta.env.VITE_API_BASE || 'http://localhost:8080'}/api/admin/comments/reported`)
    commentCount.value = commentsRes.data.length || 0
    
    // Fetch membership requests count
    const usersRes = await axios.get(`${import.meta.env.VITE_API_BASE || 'http://localhost:8080'}/api/admin/users/membership-requests`)
    userRequestCount.value = usersRes.data.length || 0
  } catch (e) {
    console.warn('Failed to fetch notification counts:', e)
  }
}

onMounted(() => {
  if (auth.role === 'admin') {
    fetchNotificationCounts()
  }
})
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen relative">
    <!-- 1st Nav -->
    <header class="bg-white border-b border-gray-300 px-[50px] py-3 flex items-center justify-between relative z-20">
      <button @click="isOpen = !isOpen" class="text-3xl text-gray-700">
        <i v-if="!isOpen" class="bi bi-list"></i>
        <i v-else class="bi bi-x-lg"></i>
      </button>

      <div class="absolute left-1/2 transform -translate-x-1/2">
        <RouterLink to="/">
          <img src="./assets/Legit News Logo.png" alt="Legit News Logo" class="h-[60px] w-auto">
        </RouterLink>
      </div>

      <div class="flex items-center">
        <ProfileBadge />
      </div>
    </header>

    <!-- Admin Nav -->
    <nav v-if="auth.role === 'admin'" class="hidden md:flex bg-white border border-gray-300 mx-auto w-full max-w-[1200px] mt-3">
      <div class="grid grid-cols-4 w-full text-center">
        <RouterLink to="/admin/dashboard" v-slot="{ href, navigate }" class="py-3 border-r border-gray-300 text-black font-medium hover:bg-gray-100 transition [&.router-link-active]:bg-gray-100 [&.router-link-active]:font-bold">
            <a :href="href" @click="navigate" class="flex justify-center items-center h-full">
                <span>Dashboard</span>
            </a>
        </RouterLink>

        <RouterLink to="/admin/manage-news" v-slot="{ href, navigate }" class="py-3 border-r border-gray-300 text-black font-medium hover:bg-gray-100 transition [&.router-link-active]:bg-gray-100 [&.router-link-active]:font-bold">
            <a :href="href" @click="navigate" class="flex justify-center items-center h-full">
                <span>Manage News</span>
            </a>
        </RouterLink>

        <RouterLink to="/admin/manage-comment" v-slot="{ href, navigate }" class="relative py-3 border-r border-gray-300 text-black font-medium hover:bg-gray-100 transition [&.router-link-active]:bg-gray-100 [&.router-link-active]:font-bold">
            <a :href="href" @click="navigate" class="flex justify-center items-center h-full">
                <span>Manage Comment</span>
                <span v-if="commentCount > 0" class="ml-2 inline-flex items-center bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full leading-none">
                    {{ commentCount }}
                </span>
            </a>
        </RouterLink>

        <RouterLink to="/admin/manage-user" v-slot="{ href, navigate }" class="relative py-3 text-black font-medium hover:bg-gray-100 transition [&.router-link-active]:bg-gray-100 [&.router-link-active]:font-bold">
            <a :href="href" @click="navigate" class="flex justify-center items-center h-full">
                <span>Manage User</span>
                <span v-if="userRequestCount > 0" class="ml-2 inline-flex items-center bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full leading-none">
                    {{ userRequestCount }}
                </span>
            </a>
        </RouterLink>
      </div>
    </nav>

    <!-- 2nd Nav  -->
    <nav class="hidden md:flex bg-white border-b border-gray-300 mx-auto w-full max-w-[1200px] items-center justify-between mt-3">
      <div class="flex flex-wrap gap-1">
        <RouterLink to="/" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200">All News</RouterLink>
        <RouterLink to="/category/Local News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200"
          >Local
        </RouterLink>
        <RouterLink to="/category/Global News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200"
          >Global
        </RouterLink>
        <RouterLink to="/category/Business News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200"
          >Business
        </RouterLink>
        <RouterLink to="/category/Sport News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200"
          >Sport
        </RouterLink>
        <RouterLink to="/category/Entertainment News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200"
          >Entertainment
        </RouterLink>
      </div>

      <div class="flex justify-center md:justify-end">
        <input
          v-model="searchTerm"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="Search News"
          class="px-3 py-1 w-[280px] border border-gray-300 rounded"
        />
      </div>
    </nav>

    <!-- Mobile -->
    <div v-if="isOpen" class="absolute top-[70px] left-0 w-full bg-white shadow-lg z-50">
      <nav class="flex flex-col space-y-3 px-6 py-4">
        <p class="text-gray-500 text-sm font-semibold mt-2">Admin Menu</p>
        <RouterLink to="/admin/dashboard" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 border-none">Dashboard</RouterLink>
        <RouterLink to="/admin/manage-news" class="flex items-center px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 border-none relative">
            Manage News
            <span v-if="newsCount > 0" class="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full leading-none absolute right-3">
                {{ newsCount }}
            </span>
        </RouterLink>
        <RouterLink to="/admin/manage-comment" class="flex items-center px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 border-none relative">
            Manage Comment
            <span v-if="commentCount > 0" class="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full leading-none absolute right-3">
                {{ commentCount }}
            </span>
        </RouterLink>
        <RouterLink to="/admin/manage-user" class="flex items-center px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 border-none relative">
            Manage User
            <span v-if="userRequestCount > 0" class="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full leading-none absolute right-3">
                {{ userRequestCount }}
            </span>
        </RouterLink>

        <hr class="my-3 border-gray-300" />
        <p class="text-gray-500 text-sm font-semibold mt-2">Categories</p>
        <RouterLink to="/" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 border-none">All News</RouterLink>
        <RouterLink to="/category/Local News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 border-none">Local</RouterLink>
        <RouterLink to="/category/Global News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 border-none">Global</RouterLink>
        <RouterLink to="/category/Business News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 border-none">Business</RouterLink>
        <RouterLink to="/category/Sport News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 border-none">Sport</RouterLink>
        <RouterLink to="/category/Entertainment News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 border-none">Entertainment</RouterLink>

        <input
          v-model="searchTerm"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="Search News"
          class="px-3 py-2 w-full border border-gray-300 rounded mt-3"
        />
      </nav>
    </div>

    <!-- Main -->
    <main class="flex-1 p-5">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="flex flex-col md:flex-row justify-between items-center px-[50px] py-8 bg-white border-t border-gray-300 space-y-6 md:space-y-0">
      <div class="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
        <p>Follow us on:</p>
        <div class="flex space-x-3 mt-2">
          <a href="https://www.facebook.com/htet.o.thu" target="_blank" rel="noopener" class="text-gray-600 hover:text-blue-500 text-2xl">
            <i class="bi bi-facebook"></i>
          </a>
          <a href="https://www.instagram.com/htet_hot/" target="_blank" rel="noopener" class="text-gray-600 hover:text-pink-500 text-2xl">
            <i class="bi bi-instagram"></i>
          </a>
          <a href="https://www.youtube.com/@kaungkhantsan12" target="_blank" rel="noopener" class="text-gray-600 hover:text-red-500 text-2xl">
            <i class="bi bi-youtube"></i>
          </a>
        </div>
      </div>

      <div class="flex-1 text-center">
        <p>
          Contact us:
          <a href="mailto:legitnews25@gmail.com" class="text-blue-600 underline hover:text-blue-800">legitnews25@gmail.com</a>
        </p>

        <div>
          <RouterLink to="/terms" class="mx-2 text-black text-sm hover:underline">Terms of Use</RouterLink> |
          <RouterLink to="/about" class="mx-2 text-black text-sm hover:underline">About Us</RouterLink>
        </div>
      </div>

      <div class="flex-1 flex justify-center md:justify-end">
        <img src="./assets/Legit News Logo.png" alt="Legit News Logo" class="h-[60px] w-auto">
      </div>
    </footer>
  </div>
</template>
