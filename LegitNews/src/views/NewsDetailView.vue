<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'

const route = useRoute()
const router = useRouter()
const store = useNewsStore()

const newsId = Number(route.params.id)
const news = store.allNews.find(n => n.id === newsId) || null

function goBackHome() {
  router.push('/') // redirect to home
}
</script>

<template>
  <div v-if="news" style="padding: 20px">
    <h1>{{ news.headline }}</h1>
    <img :src="news.image" alt="news image" style="max-width: 300px; display: block; margin: 10px 0;">
    
    <p>{{ news.detail }}</p>

    <small>
      Reporter: {{ news.reporter }} | {{ news.date }}
    </small>

    <div style="margin-top: 10px;">
      Status: 
      <span v-if="news.votes.real > news.votes.fake" style="color: green; font-weight: bold;">Real</span>
      <span v-else style="color: red; font-weight: bold;">Fake</span>
    </div>

    <!-- Vote button -->
    <router-link :to="`/news/${news.id}/vote`">
      <button style="margin-top:20px; padding:8px 16px; background:#28a745; color:white; border:none; border-radius:5px; cursor:pointer;">
        Vote & Comment
      </button>
    </router-link>

    <!-- Back button -->
    <button @click="goBackHome"
      style="margin-top:20px; margin-left:10px; padding:8px 16px; background:#6c757d; color:white; border:none; border-radius:5px; cursor:pointer;">
      ⬅ Back to Home
    </button>
  </div>

  <div v-else style="padding:20px;">
    <p>⚠️ News not found</p>
  </div>
</template>
