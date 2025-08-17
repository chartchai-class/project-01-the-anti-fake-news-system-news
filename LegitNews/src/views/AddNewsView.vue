<script setup>
import { ref } from 'vue'
import { useNewsStore } from '@/stores/newsStore'
import { useRouter } from 'vue-router'

const store = useNewsStore()
const router = useRouter()

const headline = ref("")
const detail = ref("")
const reporter = ref("")
const image = ref("")

function submitNews() {
  if (!headline.value || !detail.value) {
    alert("⚠️ Headline and Detail are required.")
    return
  }

  const newNews = {
    id: store.allNews.length + 1,
    headline: headline.value,
    detail: detail.value,
    reporter: reporter.value || "Anonymous",
    date: new Date().toLocaleString(),
    image: image.value || "https://via.placeholder.com/150",
    votes: { real: 0, fake: 0 }
  }

  store.newsList.unshift(newNews) // add to top
  alert("✅ News added successfully!")
  router.push('/')
}
</script>

<template>
  <div style="padding:20px;">
    <h2>Add News</h2>

    <div>
      <label>Headline:</label><br />
      <input v-model="headline" style="width:100%; margin-bottom:10px;" />
    </div>

    <div>
      <label>Detail:</label><br />
      <textarea v-model="detail" style="width:100%; height:100px; margin-bottom:10px;"></textarea>
    </div>

    <div>
      <label>Reporter (optional):</label><br />
      <input v-model="reporter" style="width:100%; margin-bottom:10px;" />
    </div>

    <div>
      <label>Image URL (optional):</label><br />
      <input v-model="image" style="width:100%; margin-bottom:10px;" />
    </div>

    <button @click="submitNews" 
      style="padding:8px 16px; background:#28a745; color:white; border:none; border-radius:6px; cursor:pointer;">
      Submit
    </button>
  </div>
</template>
