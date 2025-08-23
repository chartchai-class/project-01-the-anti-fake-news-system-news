<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const store = useNewsStore()

// Get news by ID
const newsId = Number(route.params.id)
const news = store.allNews.find(n => n.id === newsId) || null

// detect mode
const isViewOnly = computed(() => route.name === 'view-comment')

// Form state
const selectedVote = ref(null)   // "real" or "fake"
const commentText = ref("")
const commentImage = ref("")

// Handle submit
function submitVote() {
  if (!selectedVote.value) {
    alert("Please select Real or Fake before submitting.")
    return
  }

  if (!news) {
    alert("News not found")
    return
  }

  // Update votes
  if (selectedVote.value === "real") {
    news.votes.real++
  } else {
    news.votes.fake++
  }

  // Save comment
  if (commentText.value.trim() || commentImage.value.trim()) {
    news.comments.push({
      text: commentText.value,
      image: commentImage.value,
      date: new Date().toLocaleString()
    })
  }

  alert(`Thank you! Your vote for "${selectedVote.value}" has been submitted.`)

  // Reset form
  selectedVote.value = null
  commentText.value = ""
  commentImage.value = ""

  router.push(`/news/${newsId}`)  // Navigate back to news detail page
}
</script>

<template>
  <div v-if="news" style="padding:20px;">
    <h2>{{ news.headline }}</h2>
    <p><small>Reporter: {{ news.reporter }} | {{ news.date }}</small></p>

    <!-- Comments -->
    <div class="comments-section">
      <h3>💬 Comments ({{ news.comments.length }})</h3>
      <div 
        v-for="(c, i) in news.comments" 
        :key="i" 
        class="comment"
      >
        <div class="comment-avatar"></div>
        <div class="comment-body">
          <strong>Anonymous</strong>
          <p>{{ c.text }}</p>
          <img v-if="c.image" :src="c.image" alt="comment image" style="max-width:100px; margin-top:5px;" />
          <small>{{ c.date }}</small>
        </div>
      </div>
    </div>

    <!-- Show vote form only in vote page -->
    <div v-if="!isViewOnly" class="vote-section">
      <p>
        {{
          ((news.votes.real / (news.votes.real + news.votes.fake || 1)) * 100).toFixed(1)
        }}% of readers think this is real
      </p>

      <div class="vote-buttons">
        <button class="btn-real" @click="selectedVote = 'real'">Real</button>
        <button class="btn-fake" @click="selectedVote = 'fake'">Fake</button>
      </div>

      <div class="form-group">
        <input type="text" v-model="commentImage" placeholder="Image URL (Optional)" />
      </div>
      <div class="form-group">
        <textarea rows="4" v-model="commentText" placeholder="Write your comment"></textarea>
      </div>

      <div class="form-actions">
        <button class="btn-submit" @click="submitVote">Submit</button>
        <button class="btn-cancel" @click="router.push(`/news/${newsId}`)">Cancel</button>
      </div>
    </div>
  </div>

  <div v-else style="padding:20px;">
    <p>⚠️ News not found</p>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}
.actions button {
  flex: 1;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #000;
  background: #fff;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.comments-section {
  margin-top: 20px;
}
.comment {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}
.comment-avatar {
  width: 40px;
  height: 40px;
  background: #ccc;
  border-radius: 50%;
  margin-right: 10px;
}
.comment-body {
  font-size: 14px;
}
.comment-body strong {
  display: block;
  margin-bottom: 3px;
}

.vote-section {
  margin-top: 20px;
}
.vote-buttons {
  margin: 15px 0;
  display: flex;
  gap: 20px;
}
.vote-buttons button {
  flex: 1;
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-real { background: #00c400; color: #fff; }
.btn-fake { background: #d90000; color: #fff; }

.form-group {
  margin-bottom: 15px;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}
.form-actions button {
  flex: 1;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border: none;
}
.btn-submit { background: #000; color: #fff; }
.btn-cancel { background: #fff; border: 1px solid #000; }
</style>