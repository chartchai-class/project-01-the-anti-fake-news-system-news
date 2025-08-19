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
  <div class="home">

    <!-- Toolbar -->
    <div class="toolbar">
      <RouterLink to="/add-news">
        <button class="add-news">Add News</button>
      </RouterLink>

      <div class="filters">
        <!-- Type Filter -->
        <div>
          <label>Sort by</label>
          <select v-model="filterType" class="sort">
            <option value="all">All News</option>
            <option value="real">Verified News</option>
            <option value="fake">Fake News</option>
          </select>
        </div>

        <!-- Items per page -->
        <div>
          <label for="select">Items per page:</label>
          <select v-model.number="itemsPerPage" id="select">
            <option :value="6">6</option>
            <option :value="9">9</option>
            <option :value="12">12</option>
            <option :value="15">15</option>
          </select>
        </div>
      </div>
    </div>

    <!-- News Cards -->
    <div class="news-container">
      <RouterLink
        v-for="news in paginatedNews"
        :key="news.id"
        :to="`/news/${news.id}`"
        style="text-decoration: none; color: inherit;"
      >
        <div class="card">
          <div class="image">
            <img :src="news.image" alt="news image" style="width:100%; height:100%; object-fit:cover;">
          </div>
          <span class="status" :class="news.votes.real > news.votes.fake ? 'verified' : 'fake'">
            {{ news.votes.real > news.votes.fake ? 'Verified' : 'Fake' }}
          </span>
          <div class="content">
            <div class="heading">{{ news.headline }}</div>
            <p>{{ news.detail.substring(0, 80) }}...</p>
            <div class="meta-row">
              <div class="meta">Reporter: {{ news.reporter }}</div>
              <div class="meta">{{ news.date }}</div>
            </div>
          </div>
        </div>
      </RouterLink>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <span @click="prevPage" :style="{cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}">&lt;</span>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <span @click="nextPage" :style="{cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}">&gt;</span>
    </div>

  </div>
</template>

<style scoped>
/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 30px;
  border-bottom: 1px solid #ddd;
  background: #fff;
  margin-bottom: 30px;
}

.add-news {
  background: black;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
}

.filters {
  display: flex;
  align-items: center;
  gap: 30px;
}

.filters select, #select {
  border: 1px solid #aaa;
  border-radius: 3px;
  text-align: center;
  height: 30px;
}

/* News Cards */
.news-container {
  padding: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: flex-start;
}

.card {
  width: 380px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  overflow: hidden;
  position: relative;
}

.card .image {
  height: 150px;
  overflow: hidden;
}

.status {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.verified {
  background: #28a745;
}

.fake {
  background: #dc5045;
}

.card .content {
  padding: 10px;
}

.card .heading {
  font-weight: bold;
  margin: 5px 0;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 13px;
  color: #666;
}

/* Pagination */
.pagination {
  text-align: center;
  margin: 20px 0;
  font-size: 16px;
}
</style>

