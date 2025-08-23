<script setup>
import { useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'
import { ref } from 'vue'
import VoteCommentView from './VoteCommentView.vue'   // reuse teammate’s design

const route = useRoute()
const store = useNewsStore()

const newsId = Number(route.params.id)
const news = store.allNews.find(n => n.id === newsId) || null

// dropdown toggles
const showComment = ref(false)
const showVote = ref(false)

function toggleComment() {
  showComment.value = !showComment.value
  showVote.value = false // close other dropdown
}

function toggleVote() {
  showVote.value = !showVote.value
  showComment.value = false // close other dropdown
}
</script>

<template>
  <div class="container" v-if="news">
    <!-- Main -->
    <div class="main-content">
      <div class="main-header">
        <span>{{ news.headline }}</span>
        <div class="vote-box">
          <span class="vote-up">{{ news.votes.real }}</span>
          <span class="vote-down">{{ news.votes.fake }}</span>
        </div>
      </div>

      <div class="sub-info">
        Reporter: {{ news.reporter }} | {{ news.date }}
      </div>

      <div class="news-image">
        <img :src="news.image" alt="news image" style="max-width:100%; border-radius:8px;">
      </div>

      <div class="news-text">
        <p>{{ news.detail }}</p>
      </div>

      <!-- Action buttons -->
      <div class="actions">
        <button @click="toggleComment">
          {{ showComment ? "Hide Comments" : "View Comment" }}
        </button>
        <button @click="toggleVote">
          {{ showVote ? "Cancel Vote" : "Vote & Comment" }}
        </button>
      </div>

      <!-- Dropdown for comments -->
      <div v-if="showComment" style="margin-top:20px;">
        <VoteCommentView :id="newsId" mode="view-comment" />
      </div>

      <!-- Dropdown for voting -->
      <div v-if="showVote" style="margin-top:20px;">
        <VoteCommentView :id="newsId" mode="vote" />
      </div>
    </div>

    <!-- Sidebar -->
    <div class="sidebar">
      <div v-for="(item, i) in store.allNews.slice(0, 2)" :key="i" class="card">
        <div class="card-image">
          <img :src="item.image" alt="card image" style="max-width:100%; height:100%; object-fit:cover;">
        </div>
        <div class="card-body">
          <span class="verified" :class="item.votes.real > item.votes.fake ? 'verified' : ''">
            {{ item.votes.real > item.votes.fake ? 'Verified' : 'Fake' }}
          </span>
          <div class="card-title">{{ item.headline }}</div>
          <div class="card-info">{{ item.reporter }}</div>
          <div class="card-footer">
            <span>{{ item.reporter }}</span>
            <span>{{ item.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else style="padding:20px;">
    <p>⚠️ News not found</p>
  </div>
</template>


<style scoped>
.container {
  display: flex;
  gap: 20px;
  max-width: 1240px;
  width: 100%;
  margin: 20px auto;
}

/* Left Detail Section */
.main-content {
  background: #fff;
  width: 800px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.main-header {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sub-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.vote-box {
  display: flex;
  gap: 5px;
}

.vote-box span {
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: bold;
  color: #fff;
  font-size: 12px;
}

.vote-up { background: #00c400; }
.vote-down { background: #d90000; }

.news-image {
  background: #e5e5e5;
  width: 100%;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  border-radius: 8px;
  font-size: 18px;
  color: #555;
}

.news-text {
  background: #e5e5e5;
  min-height: 150px;
  padding: 10px;
  border-radius: 8px;
  font-size: 16px;
  color: #555;
}

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

/* Right Sidebar */
.sidebar {
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.card-image {
  background: #e5e5e5;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #555;
}

.card-body {
  padding: 12px;
}

.verified {
  display: inline-block;
  background: #00e600;
  color: #000;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  margin: 5px 0;
  background: #f2f2f2;
  padding: 4px;
  border-radius: 4px;
}

.card-info {
  font-size: 12px;
  color: #555;
  margin-bottom: 5px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #555;
}
</style>
