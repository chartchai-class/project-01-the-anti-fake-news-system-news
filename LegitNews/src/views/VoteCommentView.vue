<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useNewsStore } from '@/stores/newsStore'
import { useAuthStore } from '@/stores/authStore'
import { useRoute } from 'vue-router'

const props = defineProps({
  id: { type: Number, required: true },
  mode: { type: String, default: "vote" }
})

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
const api = axios.create({ baseURL: `${API_BASE}/api` })

const store = useNewsStore()
const route = useRoute()
const auth  = useAuthStore()
auth.init()

const news = store.allNews.find(n => n.id === props.id) || null
const isViewOnly = computed(() => props.mode === 'view-comment')

const selectedVote      = ref(null)
const commentName       = ref("")
const commentText       = ref("")
const commentImage      = ref(null)
const hasVoted          = ref(false)
const userVote          = ref(null)
const userCommentIndex  = ref(null)
const anonymous         = ref(false)

// --- local vote persistence ---
function voteKey(newsId, userId) { return `nv_${newsId}_${userId}` }
function saveVoteState(newsId, userId, v) {
  sessionStorage.setItem(voteKey(newsId, userId), JSON.stringify({ hasVoted: true, userVote: v }))
}
function loadVoteState(newsId, userId) {
  try { return JSON.parse(sessionStorage.getItem(voteKey(newsId, userId)) || 'null') } catch { return null }
}

onMounted(async () => {
  if (!news) return

  // refresh comments from backend
  const loaded = await store.fetchComments(news.id)
  news.comments = loaded

  // restore vote state + locate my comment
  if (auth.isLoggedIn) {
    const sv = loadVoteState(news.id, auth.currentUser.id)
    if (sv?.hasVoted) {
      hasVoted.value = true
      userVote.value = sv.userVote
      selectedVote.value = sv.userVote
    }
    const idx = news.comments.findIndex(c => c.userId === auth.currentUser.id)
    if (idx !== -1) userCommentIndex.value = idx
  }

  // if navigated from admin "View", scroll to comment
  const cid = route.query?.commentId
  if (cid) {
    requestAnimationFrame(() => {
      const el = document.getElementById(`c-${cid}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-2','ring-blue-500','rounded')
        setTimeout(() => el.classList.remove('ring-2','ring-blue-500','rounded'), 1400)
      }
    })
  }
})

async function submitVote() {
  if (!auth.isLoggedIn) { alert("Please log in first to vote or comment."); return }
  if (!selectedVote.value) { alert("Please select Real or Fake before submitting."); return }
  if (!news) { alert("News not found"); return }

  try {
    await api.post(`/news/${news.id}/vote`, null, { params: { value: selectedVote.value, userId: auth.currentUser.id } })
  } catch (e) {
    console.error(e); alert("Vote failed."); return
  }

  // adjust tallies locally
  if (hasVoted.value && userVote.value) {
    if (userVote.value === "real") news.votes.real--
    else if (userVote.value === "fake") news.votes.fake--
  }
  if (selectedVote.value === "real") news.votes.real++
  else news.votes.fake++

  const displayName = (anonymous.value
    ? "Anonymous"
    : (commentName.value.trim() || auth.currentUser?.name || "Anonymous"))

  // optional image upload (if your store has it)
  let imageUrl = ""
  try {
    if (commentImage.value instanceof File && typeof store.uploadCommentImage === 'function') {
      imageUrl = await store.uploadCommentImage(commentImage.value, news.category)
    }
  } catch (e) {
    console.warn("Image upload skipped/failed:", e)
  }

  // add/edit comment minimally
  if (commentText.value.trim() || imageUrl) {
    const userId = auth.currentUser.id
    try {
      if (userCommentIndex.value !== null && userCommentIndex.value >= 0) {
        const existing = news.comments[userCommentIndex.value]
        let updated
        if (typeof store.editComment === 'function') {
          updated = await store.editComment(news.id, existing.id, {
            userId, content: commentText.value.trim(), imageUrl, anonymous: anonymous.value
          })
        } else {
          // fallback direct API
          const res = await api.put(`/news/${news.id}/comments/${existing.id}`, null, {
            params: { userId, content: commentText.value.trim(), imageUrl, anonymous: anonymous.value }
          })
          updated = res.data
        }
        news.comments[userCommentIndex.value] = {
          id: updated.id,
          userId: updated.userId || userId,
          name: updated.userName || displayName,
          text: updated.content || "",
          image: updated.imageUrl || "",
          date: updated.createdAt ? new Date(updated.createdAt).toLocaleString() : new Date().toLocaleString()
        }
      } else {
        let created
        if (typeof store.addComment === 'function') {
          created = await store.addComment(news.id, { userId, content: commentText.value.trim(), imageUrl, anonymous: anonymous.value })
        } else {
          const res = await api.post(`/news/${news.id}/comments`, null, {
            params: { userId, content: commentText.value.trim(), imageUrl, anonymous: anonymous.value }
          })
          created = res.data
        }
        const item = {
          id: created.id,
          userId: created.userId || userId,
          name: created.userName || displayName,
          text: created.content || "",
          image: created.imageUrl || "",
          date: created.createdAt ? new Date(created.createdAt).toLocaleString() : new Date().toLocaleString()
        }
        news.comments.push(item)
        userCommentIndex.value = news.comments.length - 1
      }
    } catch (e) {
      console.error(e)
      alert("Comment failed to save, but your vote was recorded.")
    }
  }

  hasVoted.value = true
  userVote.value = selectedVote.value
  saveVoteState(news.id, auth.currentUser.id, selectedVote.value)
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

async function reportThisComment(c) {
  if (!auth.isLoggedIn) { alert('Please log in to report.'); return }
  if (auth.role === 'admin') return
  try {
    if (typeof store.reportComment === 'function') {
      await store.reportComment(news.id, c.id, { reason: 'User report' })
    } else {
      await api.post(`/news/${news.id}/comments/${c.id}/report`, null, { params: { reason: 'User report' } })
    }
    alert('✅ Comment has been reported to admins.')
  } catch (e) {
    console.error(e); alert('Failed to report the comment.')
  }
}

async function adminDeleteThisComment(c) {
  if (auth.role !== 'admin') return
  if (!confirm('Delete this comment? This cannot be undone.')) return
  try {
    if (typeof store.adminDeleteComment === 'function') {
      await store.adminDeleteComment(news.id, c.id, { reason: 'Policy violation' })
    } else {
      await api.delete(`/admin/news/${news.id}/comments/${c.id}`, { params: { reason: 'Policy violation' } })
    }
    const idx = news.comments.findIndex(x => x.id === c.id)
    if (idx !== -1) news.comments.splice(idx, 1)
  } catch (e) {
    console.error(e); alert('Failed to delete the comment.')
  }
}
</script>

<template>
  <div v-if="news" class="p-5 sm:p-8 max-w-3xl mx-auto">
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-3">💬 Comments ({{ news.comments.length }})</h3>
      <div v-for="(c, i) in news.comments" :key="c.id || i" :id="c.id ? `c-${c.id}` : null" class="flex items-start mb-4 space-x-3">
        <div class="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
        <div class="text-sm">
          <strong class="block font-medium">{{ c.name || 'Anonymous' }}</strong>
          <p class="mt-1">{{ c.text }}</p>
          <img v-if="c.image" :src="c.image" alt="comment image" class="max-w-[100px] mt-1 rounded" />
          <small class="text-gray-500 block mt-1">{{ c.date }}</small>

          <div class="mt-1 text-xs flex gap-3">
            <!-- Report (non-admin) -->
            <button
              v-if="$pinia.state.value.auth?.currentUser?.role?.toLowerCase?.() !== 'admin'"
              @click="reportThisComment(c)"
              class="text-blue-600 hover:underline"
              type="button"
            >
              Report
            </button>

            <!-- Delete (admin only) -->
            <button
              v-if="$pinia.state.value.auth?.currentUser?.role?.toLowerCase?.() === 'admin'"
              @click="adminDeleteThisComment(c)"
              class="text-red-600 hover:underline"
              type="button"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!isViewOnly" class="mb-6">
      <p class="mb-2">
        {{ ((news.votes.real / (news.votes.real + news.votes.fake || 1)) * 100).toFixed(1) }}% of readers think this is real
      </p>

      <div v-if="!hasVoted" class="space-y-4">
        <div class="flex gap-4 mb-4">
          <button
            type="button"
            @click="selectedVote = 'real'"
            :class="['flex-1 py-2 font-bold rounded-md text-white transition-transform', selectedVote === 'real' ? 'bg-green-500 scale-105' : 'bg-green-600 opacity-70 hover:opacity-100']"
          >Real</button>
          <button
            type="button"
            @click="selectedVote = 'fake'"
            :class="['flex-1 py-2 font-bold rounded-md text-white transition-transform', selectedVote === 'fake' ? 'bg-red-500 scale-105' : 'bg-red-600 opacity-70 hover:opacity-100']"
          >Fake</button>
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
