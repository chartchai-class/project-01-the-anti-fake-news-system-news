<script setup>
import { useNewsStore } from '@/stores/newsStore'
import { RouterLink, useRoute } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'

const store = useNewsStore()
const route = useRoute()

const isLoading = ref(true)

onMounted(async () => {
  isLoading.value = true
  await store.fetchNews()
  setTimeout(() => (isLoading.value = false), 500)
})

watch(
  () => [route.params.name, route.params.term],
  () => {
    currentPage.value = 1
    isLoading.value = true
    setTimeout(() => (isLoading.value = false), 500)
  }
)

const currentPage = ref(1)
const itemsPerPage = ref(9)

const filterType = ref("all") // all, real, fake
const reporterFilter = ref("")
const sortOrder = ref("newest") // newest or oldest
const startDate = ref("")
const endDate = ref("")

const categoryFilter = computed(() => route.params.name || null)
const searchFilter = computed(() => route.params.term || null)

const filteredNews = computed(() => {
  let list = [...store.allNews]

  if (categoryFilter.value) {
    list = list.filter(
      n => (n.category || "").toLowerCase() === categoryFilter.value.toLowerCase()
    )
  }

  if (searchFilter.value) {
    const term = searchFilter.value.toLowerCase()
    list = list.filter(n =>
      (n.headline || "").toLowerCase().includes(term)
    )
  }

  if (filterType.value === "real") {
    list = list.filter(n => n.votes.real > n.votes.fake)
  } else if (filterType.value === "fake") {
    list = list.filter(n => n.votes.fake >= n.votes.real)
  }

  if (reporterFilter.value.trim()) {
    list = list.filter(n =>
      n.reporter.toLowerCase().includes(reporterFilter.value.toLowerCase())
    )
  }

  if (startDate.value) {
    list = list.filter(n => new Date(n.date) >= new Date(startDate.value))
  }
  if (endDate.value) {
    list = list.filter(n => new Date(n.date) <= new Date(endDate.value))
  }

  list.sort((a, b) => {
    const da = new Date(a.date)
    const db = new Date(b.date)
    return sortOrder.value === "newest" ? db - da : da - db
  })

  return list
})

const totalPages = computed(() =>
  Math.ceil(filteredNews.value.length / itemsPerPage.value)
)

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredNews.value.slice(start, start + itemsPerPage.value)
})

function nextPage() {
  if (currentPage.value < totalPages.value) {
    isLoading.value = true
    setTimeout(() => {
      currentPage.value++
      isLoading.value = false
    }, 500)
  }
}
function prevPage() {
  if (currentPage.value > 1) {
    isLoading.value = true
    setTimeout(() => {
      currentPage.value--
      isLoading.value = false
    }, 500)
  }
}

function clearFilters() {
  filterType.value = "all"
  reporterFilter.value = ""
  startDate.value = ""
  endDate.value = ""
  sortOrder.value = "newest"
  itemsPerPage.value = 9
  currentPage.value = 1
}
</script>

<template>
  <div class="home">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center px-6 py-3 border-b border-gray-300 bg-white mb-8 gap-4">
      
      <div class="w-full sm:w-auto">
        <RouterLink to="/add-news">
          <button class="w-full sm:w-auto bg-black text-white px-4 py-2 rounded cursor-pointer">
            Add News
          </button>
        </RouterLink>
      </div>

      <div class="flex flex-row gap-4 w-full sm:w-auto sm:items-center sm:justify-end">
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <label class="text-sm">Sort By</label>
          <select
            v-model="filterType"
            class="border border-gray-400 rounded text-center h-[30px] text-sm px-2 flex-1 sm:flex-none"
          >
            <option value="all">All News</option>
            <option value="real">Verified News</option>
            <option value="fake">Fake News</option>
          </select>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <label for="select" class="text-sm">Select</label>
          <select
            v-model.number="itemsPerPage"
            id="select"
            class="border border-gray-400 rounded text-center h-[30px] text-sm px-2 flex-1 sm:flex-none"
          >
            <option :value="6">6</option>
            <option :value="9">9</option>
            <option :value="12">12</option>
            <option :value="15">15</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
      <div class="w-24 h-24 border-8 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
    </div>

    <div
      v-else
      class="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto"
    >
      <RouterLink
        v-for="news in paginatedNews"
        :key="news.id"
        :to="`/news/${news.id}`"
        class="no-underline text-inherit"
      >
        <div class="w-full bg-white rounded-lg shadow-md overflow-hidden relative hover:shadow-lg transition">
          <div class="h-[150px] overflow-hidden">
            <img
              :src="news.image"
              alt="news image"
              class="w-full h-full object-cover"
            />
          </div>

          <span
            class="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white"
            :class="news.votes.real > news.votes.fake ? 'bg-green-600' : 'bg-red-500'"
          >
            {{ news.votes.real > news.votes.fake ? 'Verified' : 'Fake' }}
          </span>

          <div class="p-3">
            <div class="font-bold my-1">{{ news.headline }}</div>
            <p class="text-sm">{{ news.detail.substring(0, 80) }}...</p>

            <div class="flex justify-between text-[13px] text-gray-600 mt-2">
              <div>Reporter: {{ news.reporter }}</div>
              <div>{{ news.date }}</div>
            </div>
          </div>
        </div>
      </RouterLink>
    </div>

    <div
      v-if="!isLoading"
      class="text-center my-5 text-base flex justify-center items-center gap-4"
    >
      <span
        @click="prevPage"
        :class="['cursor-pointer select-none', currentPage === 1 ? 'opacity-40 cursor-not-allowed' : '']"
      >&lt;</span>

      <span>Page {{ currentPage }} / {{ totalPages }}</span>

      <span
        @click="nextPage"
        :class="['cursor-pointer select-none', currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : '']"
      >&gt;</span>
    </div>
  </div>
</template>

