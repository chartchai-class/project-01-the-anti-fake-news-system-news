<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'

const route = useRoute()
const router = useRouter()
const store = useNewsStore()

const currentTab = computed(() => route.query.tab === 'deleted' ? 'deleted' : 'active')
const searchQuery = ref('')
const selectedCategory = ref('All News')
const selectedStatus = ref('Status')
const isLoading = ref(false)

const categories = ['All News', 'Local', 'Global', 'Business', 'Sports', 'Entertainment']
const statuses   = ['Status', 'All News', 'Verified News', 'Fake News']

const activeNewsData  = ref([])
const deletedNewsData = ref([])


async function loadTab() {
  isLoading.value = true
  try {
    if (currentTab.value === 'active') {
      activeNewsData.value  = await store.fetchAdminNews({ status: 'active',  page: 0, size: 200 })
    } else {
      deletedNewsData.value = await store.fetchAdminNews({ status: 'deleted', page: 0, size: 200 })
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(loadTab)
watch(() => route.query.tab, loadTab)



watch(() => route.query.tab, () => {
  searchQuery.value = ''
  selectedCategory.value = 'All News'
  selectedStatus.value = 'Status'
})

// ---- (unchanged) filters + helpers ----
const newsToShow = computed(() => currentTab.value === 'deleted' ? deletedNewsData.value : activeNewsData.value)

const filteredNews = computed(() => {
  let filtered = [...newsToShow.value]
  const term = searchQuery.value.toLowerCase().trim()

  if (term) {
    filtered = filtered.filter(n =>
      (n.title || n.headline || '').toLowerCase().includes(term) ||
      (n.author || n.reporter || '').toLowerCase().includes(term)
    )
  }

  // For active tab only
  if (currentTab.value === 'active' && selectedCategory.value !== 'All News') {
    filtered = filtered.filter(n => (n.category || '') === selectedCategory.value)
  }
  if (currentTab.value === 'active' && selectedStatus.value !== 'Status' && selectedStatus.value !== 'All News') {
    const need = selectedStatus.value === 'Verified News' ? 'Verified' : 'Fake'
    filtered = filtered.filter(n => {
      const isVerified = Number(n.votes?.real ?? 0) > Number(n.votes?.fake ?? 0)
      return need === 'Verified' ? isVerified : !isVerified
    })
  }
  return filtered.map(n => ({
    id: n.id,
    title: n.title || n.headline || 'Untitled',
    author: n.author || n.reporter || 'Anonymous',
    submittedBy: n.createdByName || 'System',
    category: n.category || 'General',
    date: n.date || '',
    status: (Number(n.votes?.real ?? 0) > Number(n.votes?.fake ?? 0)) ? 'Verified' : 'Fake',
    views: n.views ?? 0,
    hidden: !!n.hidden
  }))
})

function changeTab(tab) {
  if (tab !== currentTab.value) {
    router.push({ query: { tab: tab === 'active' ? undefined : 'deleted' } })
  }
}

async function handleDeleteNews(id, title) {
  if (!confirm(`Hide this news?\n\n${title}`)) return
  await store.adminHideNews(id)   // DB: hidden=true
  await loadTab()                 // refresh current tab (now it moves to Deleted)
}

async function handleUndoDelete(id) {
  await store.adminRestoreNews(id) // DB: hidden=false
  await loadTab()                  // refresh current tab (now it moves to Active)
}

function handleViewNews(id) { router.push({ name: 'news-detail', params: { id } }) }
function handleEditNews(id) { router.push({ name: 'edit-news',   params: { id } }) }

function getStatusClass(status) {
  switch (status) {
    case 'Verified': return 'bg-green-100 text-green-800'
    case 'Fake':     return 'bg-red-100 text-red-800'
    default:         return 'bg-gray-100 text-gray-700'
  }
}
</script>


<template>
  <div class="sm:p-8 min-h-screen font-inter">
    <div class="max-w-[1200px] mx-auto">
      <!-- Tabs + Controls (same structure) -->
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-2">
        <div class="flex items-center space-x-4 mb-4 sm:mb-0 overflow-x-auto whitespace-nowrap">
          <button
            @click="changeTab('active')"
            :class="['py-2 px-4 transition-colors duration-200', currentTab === 'active' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700']"
          >Active News</button>
          <button
            @click="changeTab('deleted')"
            :class="['py-2 px-4 transition-colors duration-200', currentTab === 'deleted' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700']"
          >Delete History</button>
        </div>

        <div class="flex space-x-4">
          <template v-if="currentTab === 'active'">
            <select v-model="selectedCategory" class="h-10 px-3 py-1 text-sm border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 ml-4 hidden md:block">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <select v-model="selectedStatus" class="h-10 px-3 py-1 text-sm border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 hidden md:block">
              <option v-for="stat in statuses" :key="stat" :value="stat">{{ stat }}</option>
            </select>
          </template>

          <RouterLink to="/add-news">
            <button class="w-full sm:w-auto bg-black text-white text-base font-semibold px-4 py-2 rounded cursor-pointer hover:bg-gray-800">
              Add News
            </button>
          </RouterLink>
        </div>
      </div>

      <!-- Mobile filters (kept) -->
      <div v-if="currentTab === 'active'" class="flex gap-4 mb-6 md:hidden">
        <select v-model="selectedCategory" class="w-1/2 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150">
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select v-model="selectedStatus" class="w-1/2 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150">
          <option v-for="stat in statuses" :key="stat" :value="stat">{{ stat }}</option>
        </select>
      </div>

      <!-- Search -->
      <div class="mb-6">
        <div class="relative flex-grow">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search news by title or author..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
          />
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center min-h-[300px] bg-white rounded-xl shadow-lg">
        <div class="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-100">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr v-if="currentTab === 'active'">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-2/12">Title</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/12">Author</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/12">Submitted By</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/12">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/12">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/12">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/12">Views</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 tracking-wider w-2/12">Actions</th>
            </tr>
            <tr v-else>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-3/12">Title</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-2/12">Author</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-2/12">Deleted?</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-2/12">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-2/12">Reason</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 tracking-wider w-1/12">Actions</th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredNews.length === 0">
              <td :colspan="currentTab === 'active' ? 8 : 6" class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                No {{ currentTab === 'active' ? 'active news articles' : 'deleted news items' }} found.
              </td>
            </tr>

            <tr
              v-for="news in filteredNews"
              :key="news.id"
              :class="currentTab === 'deleted' ? 'opacity-60' : ''"
              class="hover:bg-gray-50 transition duration-150"
            >
              <td class="px-6 py-4 text-sm font-medium text-gray-900 max-w-[340px] truncate">{{ news.title }}</td>

              <template v-if="currentTab === 'active'">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ news.author }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ news.submittedBy }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-3 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-700">{{ news.category }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ news.date }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[getStatusClass(news.status), 'px-3 inline-flex text-xs leading-5 font-semibold rounded-full flex items-center gap-1']">
                    <svg v-if="news.status === 'Verified'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ news.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ news.views }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div class="flex justify-center space-x-2">
                    <button @click="handleViewNews(news.id)" title="View" class="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button @click="handleEditNews(news.id)" title="Edit" class="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-100 transition">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button @click="handleDeleteNews(news.id, news.title)" title="Hide (soft delete)" class="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </template>

              <template v-else>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ news.author }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Hidden</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ news.date }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">—</td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div class="flex justify-center space-x-2">
                    <button @click="handleViewNews(news.id)" title="View" class="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button @click="handleUndoDelete(news.id)" title="Restore" class="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-100 transition">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 0h-4m-7 8l-2-2m0 0l-2 2m2-2v6"/></svg>
                    </button>
                  </div>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Keep your pager skeleton if you want -->
    <div v-if="!isLoading" class="text-center my-5 text-base flex justify-center items-center gap-4">
      <span class="cursor-pointer select-none opacity-40 cursor-not-allowed">&lt;</span>
      <span>Page 1 / 1</span>
      <span class="cursor-pointer select-none opacity-40 cursor-not-allowed">&gt;</span>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
.font-inter { font-family: 'Inter', sans-serif; }
</style>
