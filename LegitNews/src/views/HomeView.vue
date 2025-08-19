<script setup>
import { useNewsStore } from '@/stores/newsStore'
import { RouterLink } from 'vue-router'
import { ref, computed } from 'vue'
import { onMounted } from 'vue'


const store = useNewsStore()


onMounted(() => {
  store.fetchNews()  // tries backend, else dummy data
})

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Filter states
const filterType = ref("all") // all, real, fake
const reporterFilter = ref("")
const sortOrder = ref("newest") // newest or oldest
const startDate = ref("")
const endDate = ref("")

// Computed filtered + sorted news
const filteredNews = computed(() => {
  let list = [...store.allNews]

  // Filter: Real / Fake
  if (filterType.value === "real") {
    list = list.filter(n => n.votes.real > n.votes.fake)
  } else if (filterType.value === "fake") {
    list = list.filter(n => n.votes.fake >= n.votes.real)
  }

  // Filter by reporter
  if (reporterFilter.value.trim()) {
    list = list.filter(n => n.reporter.toLowerCase().includes(reporterFilter.value.toLowerCase()))
  }

  // Filter by date range
  if (startDate.value) {
    list = list.filter(n => new Date(n.date) >= new Date(startDate.value))
  }
  if (endDate.value) {
    list = list.filter(n => new Date(n.date) <= new Date(endDate.value))
  }

  // Sort by date
  list.sort((a, b) => {
    const da = new Date(a.date)
    const db = new Date(b.date)
    return sortOrder.value === "newest" ? db - da : da - db
  })

  return list
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredNews.value.length / itemsPerPage.value))

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredNews.value.slice(start, start + itemsPerPage.value)
})

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function clearFilters() {
  filterType.value = "all"
  reporterFilter.value = ""
  startDate.value = ""
  endDate.value = ""
  sortOrder.value = "newest"
  itemsPerPage.value = 10
  currentPage.value = 1
}


</script>

<template>
  <div class="home" style="padding: 20px">
    <h1>News Feed</h1>

    <!-- Filters -->
    <div style="margin-bottom:15px; padding:10px; border:1px solid #ccc; border-radius:6px;">
      <strong>Filters:</strong><br />

      <!-- Type filter -->
      <label><input type="radio" value="all" v-model="filterType" /> All</label>
      <label style="margin-left:10px;"><input type="radio" value="real" v-model="filterType" /> Real</label>
      <label style="margin-left:10px;"><input type="radio" value="fake" v-model="filterType" /> Fake</label>

      <!-- Reporter filter -->
      <div style="margin-top:10px;">
        <label>Reporter:</label>
        <input v-model="reporterFilter" placeholder="Search reporter..." />
      </div>

      <!-- Date range -->
      <div style="margin-top:10px;">
        <label>From:</label>
        <input type="date" v-model="startDate" />
        <label style="margin-left:10px;">To:</label>
        <input type="date" v-model="endDate" />
      </div>

      <!-- Sort -->
      <div style="margin-top:10px;">
        <label>Sort by Date:</label>
        <select v-model="sortOrder">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <!-- Items per page -->
      <div style="margin-top:10px;">
        <label>Items per page:</label>
        <select v-model.number="itemsPerPage">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="15">15</option>
          <option :value="20">20</option>
        </select>
      </div>

        <!-- Clear filters -->
  <div style="margin-top:10px;">
    <button @click="clearFilters" 
      style="padding:6px 12px; background:#dc3545; color:white; border:none; border-radius:4px; cursor:pointer;">
      ❌ Clear Filters
    </button>
  </div>
    </div>

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
