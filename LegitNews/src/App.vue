<script setup>
import { ref } from "vue"
import { RouterLink } from 'vue-router'
import 'bootstrap-icons/font/bootstrap-icons.css'

const isOpen = ref(false)
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen">

    <header class="bg-white border-b border-gray-300 px-[50px] py-4 flex items-center justify-between relative">
      <div class="logo">
        <img src="./assets/Legit News Logo.png" alt="Legit News Logo" class="h-[60px] w-auto">
      </div>

      <div class="hidden md:flex items-center gap-8">
        <nav class="flex gap-8">
          <RouterLink to="/" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 transition duration-200">
            All News
          </RouterLink>
          <RouterLink to="/local" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 transition duration-200">
            Local
          </RouterLink>
          <RouterLink to="/global" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 transition duration-200">
            Global
          </RouterLink>
          <RouterLink to="/business" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 transition duration-200">
            Business
          </RouterLink>
          <RouterLink to="/sport" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 transition duration-200">
            Sport
          </RouterLink>
          <RouterLink to="/entertainment" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 transition duration-200">
            Entertainment
          </RouterLink>
        </nav>

        <div>
          <input type="text" placeholder="Search News"
            class="px-2 py-1 w-[280px] border border-gray-300 rounded" />
        </div>
      </div>

      <!-- Hamburger  -->
      <button 
        @click="isOpen = !isOpen" 
        class="md:hidden text-3xl text-gray-700 focus:outline-none">
        <i v-if="!isOpen" class="bi bi-list"></i>
        <i v-else class="bi bi-x-lg"></i>
      </button>

      <!-- Mobile Menu -->
      <div v-if="isOpen" class="absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-300 md:hidden z-50">
        <nav class="flex flex-col space-y-3 px-6 py-4">
          <RouterLink to="/" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 transition duration-200">
            All News
          </RouterLink>
          <RouterLink to="/local" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 transition duration-200">
            Local
          </RouterLink>
          <RouterLink to="/global" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 transition duration-200">
            Global
          </RouterLink>
          <RouterLink to="/business" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 transition duration-200">
            Business
          </RouterLink>
          <RouterLink to="/sport" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 transition duration-200">
            Sport
          </RouterLink>
          <RouterLink to="/entertainment" class="px-3 py-2 rounded-lg text-black font-medium hover:bg-gray-200 transition duration-200">
            Entertainment
          </RouterLink>

        <input type="text" placeholder="Search News"
          class="px-2 py-1 w-full border border-gray-300 rounded" />
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
        <p class="m-0">Follow us on:</p>
        <div class="flex space-x-3 mt-2">
          <a href="#" class="inline-flex items-center justify-center text-gray-600 hover:text-blue-500 text-2xl">
            <i class="bi bi-facebook"></i>
          </a>
          <a href="#" class="inline-flex items-center justify-center text-gray-600 hover:text-blue-500 text-2xl">
            <i class="bi bi-instagram"></i>
          </a>
          <a href="#" class="inline-flex items-center justify-center text-gray-600 hover:text-blue-500 text-2xl">
            <i class="bi bi-youtube"></i>
          </a>
          <a href="#" class="inline-flex items-center justify-center text-gray-600 hover:text-blue-500 text-2xl">
            <i class="bi bi-tiktok"></i>
          </a>
        </div>
      </div>

      <div class="flex-1 text-center">
        <p class="m-0">Contact us: legitnews25@gmail.com</p>
        <div>
          <RouterLink to="/terms" class="mx-2 no-underline text-black text-sm hover:underline">Term of use</RouterLink> | 
          <RouterLink to="/about" class="mx-2 no-underline text-black text-sm hover:underline">About us</RouterLink>
        </div>
      </div>

      <div class="flex-1 flex justify-center md:justify-end">
        <img src="./assets/Legit News Logo.png" alt="Legit news" class="h-[60px] w-auto">
      </div>
    </footer>    
  </div>
</template>

