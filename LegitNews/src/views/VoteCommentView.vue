<script setup>
import { useNewsStore } from '@/stores/newsStore'
import { ref, computed } from 'vue'

const props = defineProps({
  id: { type: Number, required: true },
  mode: { type: String, default: "vote" } 
})

const store = useNewsStore()

const news = store.allNews.find(n => n.id === props.id) || null

const isViewOnly = computed(() => props.mode === 'view-comment')

const selectedVote = ref(null)  
const commentName = ref("")     
const commentText = ref("")
const commentImage = ref("")
const hasVoted = ref(false)      
const userVote = ref(null)       
const userCommentIndex = ref(null) 

function submitVote() {
  if (!selectedVote.value) {
    alert("Please select Real or Fake before submitting.")
    return
  }
  if (!news) {
    alert("News not found")
    return
  }

  if (hasVoted.value && userVote.value) {
    if (userVote.value === "real") news.votes.real--
    else if (userVote.value === "fake") news.votes.fake--
  }

  if (selectedVote.value === "real") {
    news.votes.real++
  } else {
    news.votes.fake++
  }

  const userDisplayName = commentName.value.trim() || "Anonymous"

  if (userCommentIndex.value !== null) {
    news.comments[userCommentIndex.value] = {
      ...news.comments[userCommentIndex.value],
      name: userDisplayName,
      text: commentText.value,
      image: commentImage.value,
      date: new Date().toLocaleString()
    }
  } else if (commentText.value.trim() || commentImage.value.trim()) {
    news.comments.push({
      name: userDisplayName,
      text: commentText.value,
      image: commentImage.value,
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
  commentText.value = userCommentIndex.value !== null ? news.comments[userCommentIndex.value].text : ""
  commentImage.value = userCommentIndex.value !== null ? news.comments[userCommentIndex.value].image : ""
  commentName.value = userCommentIndex.value !== null ? news.comments[userCommentIndex.value].name : ""
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

        <input
          type="text"
          v-model="commentName"
          placeholder="Your Name (Optional)"
          class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-black focus:bg-white"
        />
        <input
          type="text"
          v-model="commentImage"
          placeholder="Image URL (Optional)"
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
