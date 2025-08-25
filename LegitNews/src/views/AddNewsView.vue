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

async function submitNews() {
  if (!headline.value || !detail.value) {
    alert("⚠️ Headline and Detail are required.")
    return
  }

  // ✅ Create a new news object (frontend only)
  const newNews = {
    id: Date.now(),
    headline: headline.value,
    detail: detail.value,
    reporter: reporter.value || "Anonymous",
    image: image.value || "https://via.placeholder.com/150",
    date: new Date().toISOString(),
    votes: { real: 0, fake: 0 }
  }

  // ✅ Add to store
  store.newsList.unshift(newNews)

  alert("✅ News added successfully!")
  router.push('/')
}
</script>


<template>
  <div class="form-container">
    <!-- Header -->
    <div class="form-header">
      Have a story to share? Upload your news and let us verify it!
    </div>

    <!-- Form -->
    <form @submit.prevent="submitNews">
      <div class="form-body">
        <!-- Headline -->
        <div class="form-group">
          <label>Headline</label>
          <input type="text" v-model="headline" placeholder="Enter Headline" />
        </div>

        <!-- Image -->
        <div class="form-group">
          <label>Image URL</label>
          <input type="url" v-model="image" placeholder="https://" />
        </div>

        <!-- Reporter -->
        <div class="form-group">
          <label>Reporter</label>
          <input type="text" v-model="reporter" placeholder="Enter Reporter Name" />
        </div>

        <!-- Date & Time (optional, not stored) -->
        <div class="inline-fields">
          <div class="form-group">
            <label>Date</label>
            <input type="date" />
          </div>
          <div class="form-group">
            <label>Time</label>
            <input type="time" />
          </div>
        </div>

        <!-- Detail -->
        <div class="form-group">
          <label>Detail</label>
          <textarea v-model="detail" rows="3" placeholder="Enter Detail"></textarea>
        </div>
      </div>

      <!-- Footer buttons -->
      <div class="form-footer">
        <button type="submit" class="btn btn-upload">Upload</button>
        <button type="reset" class="btn btn-cancel">Cancel</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
body {
  font-family: Arial, sans-serif;
  background: #f5f5f5;
}

.form-container {
  background: #fff;
  width: 850px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin: 50px auto;
}

.form-header {
  height: 100px;
  background: #000;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding: 0 20px;
}

.form-body {
  padding: 30px 50px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

input, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 16px;
  background: #eeeeee;
  box-sizing: border-box;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #555;
  background: #fff;
}

.inline-fields {
  display: flex;
  gap: 50px;
}

.inline-fields .form-group {
  flex: 2;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  padding: 0 50px 30px 50px;
}

.btn {
  width: 120px;
  height: 40px;
  border-radius: 6px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
}

.btn-upload {
  background: #000;
  color: #fff;
}

.btn-cancel {
  background: #fff;
  border: 1px solid #000;
  color: #000;
}
</style>
