<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const store = useNewsStore()

// Get the news item by ID
const newsId = Number(route.params.id)
const news = store.allNews.find(n => n.id === newsId) || null

// Form state
const selectedVote = ref(null)   // "real" or "fake"
const commentText = ref("")
const commentImage = ref("")

// Handle submit
function submitVote() {
  if (!selectedVote.value) {
    alert("⚠️ Please select Real or Fake before submitting.")
    return
  }

  // Show success message
  alert(`✅ Thank you! Your vote for "${selectedVote.value}" has been submitted.`)

  // Later: store comment & vote into Pinia/DB here

  // Navigate back to news detail page
  router.push(`/news/${newsId}`)
}
</script>

<template>
  <div v-if="news" style="padding:20px;">
    <h2>Vote on: {{ news.headline }}</h2>
    <p><small>Reporter: {{ news.reporter }} | {{ news.date }}</small></p>
    <p>{{ news.detail }}</p>

    <!-- Vote buttons -->
    <div style="margin:15px 0;">
      <label>
        <input type="radio" value="real" v-model="selectedVote" />
        Real
      </label>
      <label style="margin-left:15px;">
        <input type="radio" value="fake" v-model="selectedVote" />
        Fake
      </label>
    </div>

    <!-- Optional comment -->
    <div>
      <label>Comment (optional):</label><br />
      <textarea v-model="commentText" placeholder="Why do you think this?" style="width:100%; height:80px;"></textarea>
    </div>

    <!-- Optional image link -->
    <div style="margin-top:10px;">
      <label>Image URL (optional):</label><br />
      <input v-model="commentImage" placeholder="https://..." style="width:100%;" />
    </div>

    <!-- Submit button -->
    <button 
      style="margin-top:15px; padding:8px 16px; background:#007bff; color:white; border:none; border-radius:5px; cursor:pointer;"
      @click="submitVote"
    >
      Submit
    </button>
  </div>

  <div v-else style="padding:20px;">
    <p>⚠️ News not found</p>
  </div>
</template>
