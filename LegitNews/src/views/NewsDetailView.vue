<script setup>
import { useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'
import { ref, computed, watch } from 'vue'
import VoteCommentView from './VoteCommentView.vue'   

const route = useRoute()
const store = useNewsStore()

const newsId = ref(Number(route.params.id))
const news = ref(store.allNews.find(n => n.id === newsId.value) || null)

const showComment = ref(false)
const showVote = ref(false)

function toggleComment() {
  showComment.value = !showComment.value
  showVote.value = false 
}

function toggleVote() {
  showVote.value = !showVote.value
  showComment.value = false 
}

// ✅ Related news: same category, exclude current
const relatedNews = computed(() => {
  if (!news.value) return []
  return store.allNews
    .filter(n => n.category === news.value.category && n.id !== news.value.id)
    .slice(0, 2)
})

// ✅ Update when navigating to a new news id
watch(
  () => route.params.id,
  (newId) => {
    newsId.value = Number(newId)
    news.value = store.allNews.find(n => n.id === newsId.value) || null
    showComment.value = false
    showVote.value = false
  }
)
</script>

<template>
  <div v-if="news" class="flex flex-col lg:flex-row gap-6 max-w-[1240px] w-full mx-auto my-6 px-4">

    <!-- Main News -->
    <div class="bg-white w-full lg:w-[800px] p-5 rounded-xl shadow-md">
      <div class="flex justify-between items-center mb-2 text-2xl font-bold">
        <span>{{ news.headline }}</span>        
      </div>

      <div class="text-sm text-gray-600 mb-4">
        <div>
          Reporter: {{ news.reporter }} | {{ news.date }}
        </div>
        <div class="flex gap-2 mt-2">
          <span class="px-3 py-1 rounded text-xs font-bold text-white bg-green-600">{{ news.votes.real }}</span>
          <span class="px-3 py-1 rounded text-xs font-bold text-white bg-red-600">{{ news.votes.fake }}</span>
        </div>
      </div>

      <div class="w-full h-64 sm:h-72 md:h-80 lg:h-96 bg-gray-100 flex items-center justify-center mb-4 rounded-lg overflow-hidden">
        <img :src="news.image" alt="news image" class="w-full h-full object-contain"/>
      </div>

      <div class="min-h-[150px] p-3 rounded-lg text-gray-700 text-base">
        <p>{{ news.detail }}</p>
      </div>

      <div class="flex gap-4 mt-5">
        <button
          @click="toggleComment"
          class="flex-1 py-3 rounded-md border border-black bg-white text-sm font-bold"
        >
          {{ showComment ? "Hide Comments" : "View Comment" }}
        </button>
        <button
          @click="toggleVote"
          class="flex-1 py-3 rounded-md border border-black bg-white text-sm font-bold"
        >
          {{ showVote ? "Cancel Vote" : "Vote & Comment" }}
        </button>
      </div>

      <div v-if="showComment" class="mt-5">
        <VoteCommentView :id="newsId" mode="view-comment" />
      </div>

      <div v-if="showVote" class="mt-5">
        <VoteCommentView :id="newsId" mode="vote" />
      </div>
    </div>

    <!-- Related News -->
    <div class="w-full lg:w-[400px] flex flex-col gap-5">
      <h3 v-if="relatedNews.length" class="text-lg font-bold px-2">📰 Related News</h3>

      <RouterLink
        v-for="(item, i) in relatedNews"
        :key="i"
        :to="`/news/${item.id}`"
        class="no-underline text-inherit"
      >
        <div class="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition">
          <div class="h-[150px] flex items-center justify-center text-gray-600 text-sm">
            <img :src="item.image" alt="card image" class="w-full h-full object-cover" />
          </div>

          <div class="p-3">
            <span
              class="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
              :class="item.votes.real > item.votes.fake ? 'bg-green-400 text-black' : 'bg-red-500 text-white'"
            >
              {{ item.votes.real > item.votes.fake ? "Verified" : "Fake" }}
            </span>

            <div class="text-lg font-bold mb-2 bg-gray-100 p-1 rounded">
              {{ item.headline }}
            </div>

            <div class="text-xs text-gray-600 mb-2">{{ item.reporter }}</div>

            <div class="flex justify-between text-xs text-gray-600">
              <span>{{ item.reporter }}</span>
              <span>{{ item.date }}</span>
            </div>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>

  <div v-else class="p-5">
    <p>⚠️ News not found</p>
  </div>
</template>
