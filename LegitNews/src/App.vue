<script setup>
import { ref } from "vue"
import { RouterLink, useRouter } from "vue-router"
import 'bootstrap-icons/font/bootstrap-icons.css'
import logo from '@/assets/Legit News Logo.png'

const isOpen = ref(false)
const searchTerm = ref("")
const router = useRouter()

function handleSearch() {
  if (searchTerm.value.trim()) {
    router.push(`/search/${encodeURIComponent(searchTerm.value.trim())}`)
    searchTerm.value = ""
    isOpen.value = false
  }
}
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen">
    <!-- Header -->
    <header class="bg-white border-b border-gray-300 px-[50px] py-4 flex items-center justify-between relative">
      <!-- Logo -->
      <div class="logo">
        <RouterLink to="/">
          <img src="logo" alt="Legit News Logo" class="h-[60px] w-auto">
        </RouterLink>
      </div>

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-8">
        <nav class="flex gap-8">
          <RouterLink to="/" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200">All News</RouterLink>
          <RouterLink to="/category/Local News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200">Local</RouterLink>
          <RouterLink to="/category/Global News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200">Global</RouterLink>
          <RouterLink to="/category/Business News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200">Business</RouterLink>
          <RouterLink to="/category/Sport News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200">Sport</RouterLink>
          <RouterLink to="/category/Entertainment News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200">Entertainment</RouterLink>
        </nav>

        <!-- Search -->
        <div>
          <input
            v-model="searchTerm"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Search News"
            class="px-2 py-1 w-[280px] border border-gray-300 rounded"
          />
        </div>
      </div>

      <!-- Hamburger -->
      <button @click="isOpen = !isOpen" class="md:hidden text-3xl text-gray-700">
        <i v-if="!isOpen" class="bi bi-list"></i>
        <i v-else class="bi bi-x-lg"></i>
      </button>

      <!-- Mobile Menu -->
      <div v-if="isOpen" class="absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-300 md:hidden z-50">
        <nav class="flex flex-col space-y-3 px-6 py-4">
          <RouterLink to="/" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200">All News</RouterLink>
          <RouterLink to="/category/Local News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200">Local</RouterLink>
          <RouterLink to="/category/Global News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200">Global</RouterLink>
          <RouterLink to="/category/Business News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200">Business</RouterLink>
          <RouterLink to="/category/Sport News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200">Sport</RouterLink>
          <RouterLink to="/category/Entertainment News" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200">Entertainment</RouterLink>

          <!-- Search in Mobile -->
          <input
            v-model="searchTerm"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Search News"
            class="px-2 py-1 w-full border border-gray-300 rounded"
          />
        </nav>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1 p-5">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="flex flex-col md:flex-row justify-between items-center px-[50px] py-8 bg-white border-t border-gray-300 space-y-6 md:space-y-0">
      <div class="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
        <p>Follow us on:</p>
        <div class="flex space-x-3 mt-2">
          <a href="#" class="text-gray-600 hover:text-blue-500 text-2xl"><i class="bi bi-facebook"></i></a>
          <a href="#" class="text-gray-600 hover:text-blue-500 text-2xl"><i class="bi bi-instagram"></i></a>
          <a href="#" class="text-gray-600 hover:text-blue-500 text-2xl"><i class="bi bi-youtube"></i></a>
          <a href="#" class="text-gray-600 hover:text-blue-500 text-2xl"><i class="bi bi-tiktok"></i></a>
        </div>
      </div>

      <div class="flex-1 text-center">
        <p>Contact us: legitnews25@gmail.com</p>
        <div>
          <RouterLink to="/terms" class="mx-2 text-black text-sm hover:underline">Terms of Use</RouterLink> | 
          <RouterLink to="/about" class="mx-2 text-black text-sm hover:underline">About Us</RouterLink>
        </div>
      </div>

      <div class="flex-1 flex justify-center md:justify-end">
        <img src="logo" alt="Legit News Logo" class="h-[60px] w-auto">
      </div>
    </footer>
  </div>
</template>


