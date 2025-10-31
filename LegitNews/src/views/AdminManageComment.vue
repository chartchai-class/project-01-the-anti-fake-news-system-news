<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'

const route = useRoute()
const router = useRouter()
const store = useNewsStore()

const currentTab = computed(() => route.query.tab === 'deleted' ? 'deleted' : 'reported')
const searchQuery = ref('')
const isLoading = ref(false)

const reportedCommentsData = ref([])
const deletedHistoryData   = ref([])

const commentsToShow = computed(() =>
  currentTab.value === 'deleted' ? deletedHistoryData.value : reportedCommentsData.value
)

const filteredComments = computed(() => {
  const term = searchQuery.value.toLowerCase().trim()
  if (!term) return commentsToShow.value
  return commentsToShow.value.filter(c =>
    (c.content || '').toLowerCase().includes(term) ||
    (c.author  || '').toLowerCase().includes(term) ||
    (c.article || '').toLowerCase().includes(term)
  )
})

async function loadTabData() {
  isLoading.value = true
  try {
    if (currentTab.value === 'deleted') {
      deletedHistoryData.value = await store.fetchAdminDeletedComments({ page: 0, size: 50 })
    } else {
      reportedCommentsData.value = await store.fetchAdminReportedComments({ page: 0, size: 50 })
    }
  } finally {
    isLoading.value = false
  }
}

function changeTab(tab) {
  if (tab !== currentTab.value) {
    searchQuery.value = ''
    router.push({ query: { tab: tab === 'reported' ? undefined : 'deleted' } })
  }
}

// Row click: only for reported (comment still exists)
function handleRowClick(row) {
  if (currentTab.value !== 'reported') return
  if (!row?.newsId) return
  router.push({ name: 'news-detail', params: { id: row.newsId }, query: { commentId: row.id } })
}

onMounted(loadTabData)
watch(() => route.query.tab, loadTabData)
</script>

<template>
  <div class="sm:p-8 min-h-screen font-inter">
    <div class="max-w-[1200px] mx-auto">
      <div class="flex items-center space-x-4 mb-6 border-b border-gray-200">
        <button
          @click="changeTab('reported')"
          :class="['py-2 px-4 transition-colors duration-200 flex items-center', currentTab === 'reported' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700']"
        >
          Reported Comments
          <span v-if="reportedCommentsData.length > 0" class="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {{ reportedCommentsData.length }}
          </span>
        </button>
        <button
          @click="changeTab('deleted')"
          :class="['py-2 px-4 transition-colors duration-200', currentTab === 'deleted' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700']"
        >
          Deleted History
        </button>
      </div>

      <div class="mb-6">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="currentTab === 'reported' ? 'Search comments by content, author, or news title...' : 'Search deleted comments by content, author, or news title...'"
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
          />
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center items-center min-h-[300px] bg-white rounded-xl shadow-lg">
        <div class="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr v-if="currentTab === 'reported'">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/3">Comment</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Author</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">News Article</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Reports</th>
              <!-- Reason column removed -->
            </tr>
            <tr v-else>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/3">Comment</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Author</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">News Article</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Deleted By</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Deleted Date</th>
              <!-- Reason column removed -->
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredComments.length === 0">
              <td :colspan="currentTab === 'reported' ? 5 : 5" class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                No {{ currentTab === 'reported' ? 'reported comments' : 'deleted history items' }} found.
              </td>
            </tr>

            <tr
              v-for="comment in filteredComments"
              :key="comment.id"
              @click="handleRowClick(comment)"
              :class="[
                'transition duration-150',
                currentTab === 'reported' ? 'cursor-pointer hover:bg-gray-50' : ''
              ]"
              tabindex="0"
              @keyup.enter="handleRowClick(comment)"
            >
              <td class="px-6 py-4 text-sm text-gray-900 max-w-[300px] truncate">{{ comment.content }}</td>

              <template v-if="currentTab === 'reported'">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ comment.author }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ comment.article }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ comment.date }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{{ comment.reports }}</td>
              </template>

              <template v-else>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ comment.author }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ comment.article }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ comment.deletedBy }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ comment.deletedDate }}</td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

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
