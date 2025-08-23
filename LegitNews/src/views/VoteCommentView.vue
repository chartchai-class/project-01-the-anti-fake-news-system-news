<script setup>
import { useNewsStore } from '@/stores/newsStore'
import { ref, computed } from 'vue'

// ✅ Accept props from parent
const props = defineProps({
  id: { type: Number, required: true },
  mode: { type: String, default: "vote" } // "view-comment" or "vote"
})

const store = useNewsStore()

// Get news by ID
const news = store.allNews.find(n => n.id === props.id) || null

// detect mode using prop
const isViewOnly = computed(() => props.mode === 'view-comment')

// Form state
const selectedVote = ref(null)   // "real" or "fake"
const commentText = ref("")
const commentImage = ref("")
const hasVoted = ref(false)       // ✅ lock state
const userVote = ref(null)        // ✅ store what user voted
const userCommentIndex = ref(null) // ✅ track which comment belongs to user

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

  // ✅ If already voted, adjust old vote
  if (hasVoted.value && userVote.value) {
    if (userVote.value === "real") news.votes.real--
    else if (userVote.value === "fake") news.votes.fake--
  }

  // ✅ Increment new vote
  if (selectedVote.value === "real") {
    news.votes.real++
  } else {
    news.votes.fake++
  }

  // ✅ Update or create comment
  if (userCommentIndex.value !== null) {
    // update existing comment
    news.comments[userCommentIndex.value] = {
      ...news.comments[userCommentIndex.value],
      text: commentText.value,
      image: commentImage.value,
      date: new Date().toLocaleString()
    }
  } else if (commentText.value.trim() || commentImage.value.trim()) {
    // add new comment
    news.comments.push({
      text: commentText.value,
      image: commentImage.value,
      date: new Date().toLocaleString()
    })
    userCommentIndex.value = news.comments.length - 1
  }

  // Lock state
  hasVoted.value = true
  userVote.value = selectedVote.value

  alert(`✅ You voted "${selectedVote.value}".`)
}

// Reset vote (allow re-voting)
function changeVote() {
  hasVoted.value = false
  selectedVote.value = userVote.value // prefill with old vote
  commentText.value = userCommentIndex.value !== null ? news.comments[userCommentIndex.value].text : ""
  commentImage.value = userCommentIndex.value !== null ? news.comments[userCommentIndex.value].image : ""
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

    <!-- Vote section -->
    <div v-if="!isViewOnly" class="vote-section">
      <p>
        {{
          ((news.votes.real / (news.votes.real + news.votes.fake || 1)) * 100).toFixed(1)
        }}% of readers think this is real
      </p>

      <!-- Show form if not voted -->
      <div v-if="!hasVoted">
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
        </div>
      </div>

      <!-- Show result if already voted -->
      <div v-else class="vote-result">
        <p>✅ You voted: <strong>{{ userVote }}</strong></p>
        <p v-if="userCommentIndex !== null && news.comments[userCommentIndex]">
          💬 Your comment: "{{ news.comments[userCommentIndex].text }}"
        </p>
        <button class="btn-cancel" @click="changeVote">Change Vote</button>
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

.vote-result {
  margin-top: 15px;
  padding: 10px;
  border-radius: 6px;
  background: #f0f0f0;
  font-size: 14px;
}

</style>