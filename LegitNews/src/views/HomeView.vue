<script setup>
import { useNewsStore } from '@/stores/newsStore'
import { RouterLink } from 'vue-router'
import { ref, computed } from 'vue'

const store = useNewsStore()

// pagination state
const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => Math.ceil(store.allNews.length / itemsPerPage))

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return store.allNews.slice(start, start + itemsPerPage)
})

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
</script>

<template>
  <div class="home" style="padding: 20px">
    <h1>News Feed</h1>

    <!-- Scrollable container -->
    <div style="max-height: 500px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; border-radius: 8px;">
      <ul style="list-style: none; padding: 0">
        <li v-for="news in paginatedNews" :key="news.id" 
            style="border: 1px solid #ccc; margin: 10px 0; padding: 10px; border-radius: 6px;">
          
          <!-- headline link -->
          <RouterLink :to="`/news/${news.id}`">
            <h3>{{ news.headline }}</h3>
          </RouterLink>

          <img :src="news.image" alt="news image" style="max-width: 150px; display: block; margin: 5px 0;">
          
          <p>{{ news.detail.substring(0, 80) }}...</p>
          
          <small>
            Reporter: {{ news.reporter }} | {{ news.date }}
          </small>
          
          <div style="margin-top: 5px;">
            Status: 
            <span v-if="news.votes.real > news.votes.fake" style="color: green; font-weight: bold;">Real</span>
            <span v-else style="color: red; font-weight: bold;">Fake</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- Pagination controls -->
    <div style="margin-top: 15px; text-align:center;">
      <button @click="prevPage" :disabled="currentPage === 1">⬅ Prev</button>
      <span style="margin: 0 10px;">Page {{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next ➡</button>
    </div>

    <!-- Add News button -->
    <div style="margin-top: 20px; text-align: center;">
      <RouterLink to="/add-news">
        <button style="padding:10px 20px; background:#007bff; color:white; border:none; border-radius:6px; cursor:pointer;">
          ➕ Add News
        </button>
      </RouterLink>
    </div>
  </div>
</template>
