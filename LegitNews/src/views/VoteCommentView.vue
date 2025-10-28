<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useNewsStore } from '@/stores/newsStore'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  id: { type: Number, required: true },
  mode: { type: String, default: "vote" }
})

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
const api = axios.create({ baseURL: `${API_BASE}/api` })

const store = useNewsStore()
const auth  = useAuthStore()

const news = store.allNews.find(n => n.id === props.id) || null
const isViewOnly = computed(() => props.mode === 'view-comment')

const selectedVote      = ref(null)
const commentName       = ref("")
const commentText       = ref("")
const commentImage      = ref(null)   // File or null
const hasVoted          = ref(false)
const userVote          = ref(null)
const userCommentIndex  = ref(null)
const anonymous         = ref(false)

async function submitVote() {
  if (!selectedVote.value) { alert("Please select Real or Fake before submitting."); return }
  if (!news) { alert("News not found"); return }

  try {
    await api.post(`/news/${news.id}/vote`, null, { params: { value: selectedVote.value } })
  } catch (e) {
    console.error(e)
    alert("Vote failed.")
    return
  }

  if (hasVoted.value && userVote.value) {
    if (userVote.value === "real") news.votes.real--
    else if (userVote.value === "fake") news.votes.fake--
  }
  if (selectedVote.value === "real") news.votes.real++
  else news.votes.fake++

  const displayName = (anonymous.value ? "Anonymous" : (commentName.value.trim() || auth.currentUser?.name || "Anonymous"))
  let imageUrl = ""

  // Optional: upload image file to Firebase (if present and store has helper)
  try {
    if (commentImage.value instanceof File && typeof store.uploadCommentImage === 'function') {
      imageUrl = await store.uploadCommentImage(commentImage.value, news.category)
    }
  } catch (e) {
    console.warn("Image upload skipped/failed:", e)
  }

  // Save comment only if text or image present
  if (commentText.value.trim() || imageUrl) {
    const userId = anonymous.value ? 1 : (auth.currentUser?.id || 1)
    try {
      // Backend currently accepts only userId + content
      await api.post(`/news/${news.id}/comments`, null, {
        params: { userId, content: commentText.value.trim() }
      })
    } catch (e) {
      console.error(e)
      alert("Comment failed to save, but your vote was recorded.")
    }

    news.comments.push({
      name: displayName,
      text: commentText.value.trim(),
      image: imageUrl || "",
      date: new Date().toLocaleString()
    })
    userCommentIndex.value = news.comments.length - 1
  }

  hasVoted.value = true
  userVote.value = selectedVote.value
  alert(`✅ You voted "${selectedVote.value}".`)
}

function changeVote() {
  hasVoted.value = false
  selectedVote.value = userVote.value
  if (userCommentIndex.value !== null && news?.comments[userCommentIndex.value]) {
    const c = news.comments[userCommentIndex.value]
    commentText.value = c.text || ""
    commentName.value = c.name || ""
  }
}
</script>

<template>
  <div v-if="news" class="p-5 sm:p-8 max-w-3xl mx-auto">

    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-3">💬 Comments ({{ news.comments.length }})</h3>
      <div v-for="(c, i) in news.comments" :key="i" class="flex items-start mb-4 space-x-3">
        <div class="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
        <div class="text-sm">
          <strong class="block font-medium">{{ c.name || 'Anonymous' }}</strong>
          <p class="mt-1">{{ c.text }}</p>
          <img v-if="c.image" :src="c.image" alt="comment image" class="max-w-[100px] mt-1 rounded" />
          <small class="text-gray-500 block mt-1">{{ c.date }}</small>
        </div>
      </div>
    </div>

    <div v-if="!isViewOnly" class="mb-6">
      <p class="mb-2">
        {{
          ((news.votes.real / (news.votes.real + news.votes.fake || 1)) * 100).toFixed(1)
        }}% of readers think this is real
      </p>

      <div v-if="!hasVoted" class="space-y-4">

        <div class="flex gap-4 mb-4">
          <button
            type="button"
            @click="selectedVote = 'real'"
            :class="[
              'flex-1 py-2 font-bold rounded-md text-white transition-transform',
              selectedVote === 'real' ? 'bg-green-500 scale-105' : 'bg-green-600 opacity-70 hover:opacity-100'
            ]"
          >
            Real
          </button>
          <button
            type="button"
            @click="selectedVote = 'fake'"
            :class="[
              'flex-1 py-2 font-bold rounded-md text-white transition-transform',
              selectedVote === 'fake' ? 'bg-red-500 scale-105' : 'bg-red-600 opacity-70 hover:opacity-100'
            ]"
          >
            Fake
          </button>
        </div>

        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="anonymous" />
          Post as Anonymous
        </label>


        <input
          type="file"
          accept="image/*"
          @change="e => commentImage.value = e.target.files?.[0] || null"
          class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black focus:bg-white"
        />

        <textarea
          rows="4"
          v-model="commentText"
          placeholder="Write your comment"
          class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black focus:bg-white"
        ></textarea>

        <button
          @click="submitVote"
          type="button"
          class="w-full py-2 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition"
        >
          Submit
        </button>
      </div>

      <div v-else class="bg-gray-100 p-3 rounded-md space-y-2 text-sm">
        <p>✅ You voted: <strong>{{ userVote }}</strong></p>
        <p v-if="userCommentIndex !== null && news.comments[userCommentIndex]">
          💬 Your comment ({{ news.comments[userCommentIndex].name }}): "{{ news.comments[userCommentIndex].text }}"
        </p>
        <button
          @click="changeVote"
          class="w-full py-2 border border-black text-black rounded-md hover:bg-gray-200 transition"
        >
          Change Vote
        </button>
      </div>
    </div>
  </div>

  <div v-else class="p-5 sm:p-8 max-w-3xl mx-auto text-gray-600">
    <p>⚠️ News not found</p>
  </div>
</template>
