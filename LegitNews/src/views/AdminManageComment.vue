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

function handleViewComment(commentId) {
  // find in reported list (only those have newsId reliably)
  const c = reportedCommentsData.value.find(x => x.id === commentId)
  if (!c?.newsId) return
  router.push({ name: 'news-detail', params: { id: c.newsId }, query: { commentId: c.id } })
}

async function handleDeleteComment(commentId, reason) {
  // if you already wired admin delete in another component, you can keep that.
  // Here we optimistically call the store's admin delete by commentId only.
  // If your backend expects /admin/news/{newsId}/comments/{id}, do that instead.
  const c = reportedCommentsData.value.find(x => x.id === commentId)
  if (!c) return
  try {
    await store.adminDeleteComment(c.newsId, c.id, { reason })
    await loadTabData() // refresh both lists as needed
  } catch (e) {
    console.error('Failed to delete comment', e)
    alert('Failed to delete comment.')
  }
}

function getReasonClass(reason) {
  switch ((reason || '').toLowerCase().split('/')[0].trim()) {
    case 'spam':
    case 'spam/scam': return 'bg-red-100 text-red-800'
    case 'offensive content':
    case 'hate speech': return 'bg-purple-100 text-purple-800'
    case 'misinformation': return 'bg-yellow-100 text-yellow-800'
    case 'spam/harassment': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-700'
  }
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
            :placeholder="currentTab === 'reported' ? 'Search comments by content, author, or news title...' : 'Search deleted comments by content, author, or reason...'"
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Reason</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 tracking-wider">Actions</th>
            </tr>
            <tr v-else>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/3">Comment</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Author</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">News Article</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Deleted By</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Deleted Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Reason</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredComments.length === 0">
              <td :colspan="7" class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                No {{ currentTab === 'reported' ? 'reported comments' : 'deleted history items' }} found.
              </td>
            </tr>

            <tr v-for="comment in filteredComments" :key="comment.id" class="hover:bg-gray-50 transition duration-150">
              <td class="px-6 py-4 text-sm text-gray-900 max-w-[300px] truncate">{{ comment.content }}</td>

              <template v-if="currentTab === 'reported'">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ comment.author }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ comment.article }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ comment.date }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{{ comment.reports }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[getReasonClass(comment.reason), 'px-3 inline-flex text-xs leading-5 font-semibold rounded-full']">
                    {{ comment.reason }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div class="flex justify-center space-x-2">
                    <button @click="handleViewComment(comment.id)" title="View Details" class="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition duration-150">
                      <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button @click="handleDeleteComment(comment.id, comment.reason)" title="Delete Comment" class="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition duration-150">
                      <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </td>
              </template>

              <template v-else>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ comment.author }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ comment.article }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ comment.deletedBy }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ comment.deletedDate }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[getReasonClass(comment.reason), 'px-3 inline-flex text-xs leading-5 font-semibold rounded-full']">
                    {{ comment.reason }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button @click="handleViewComment(comment.id)" title="View Details" class="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition duration-150">
                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- (Optional) simple pager placeholders kept from your original -->
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
