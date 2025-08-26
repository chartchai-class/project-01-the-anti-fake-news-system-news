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
const category = ref("Local News")

async function submitNews() {
  if (!headline.value || !detail.value || !category.value) {
    alert("⚠️ Headline, Detail and Category are required.")
    return
  }

  const lastId = store.newsList.length > 0 
    ? Math.max(...store.newsList.map(n => n.id)) 
    : 0

  const newNews = {
    category: category.value,
    id: lastId + 1,                     
    headline: headline.value,
    detail: detail.value,
    reporter: reporter.value || "Anonymous",
    date: new Date().toISOString().slice(0, 16).replace("T", " "),
    image: image.value || "https://via.placeholder.com/150",
    votes: { real: 0, fake: 0 },
    comments: []
  }

  store.addNews(newNews)

  // clear form
  headline.value = ""
  detail.value = ""
  reporter.value = ""
  image.value = ""
  category.value = ""

  alert("✅ News added successfully!")
  router.push('/')
}
</script>

<template>
  <div class="bg-white w-full max-w-3xl mx-auto mt-12 rounded-xl shadow-lg overflow-hidden">
    <div class="h-24 bg-black text-white flex justify-center items-center text-lg sm:text-xl font-bold text-center px-4">
      Have a story to share? Upload your news and let us verify it!
    </div>

    <form @submit.prevent="submitNews" class="p-6 sm:p-10">
      <div class="space-y-6">
        <div>
          <label class="block mb-2 text-base font-semibold text-gray-800">Headline</label>
          <input 
            type="text" 
            v-model="headline" 
            placeholder="Enter Headline"
            class="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-base focus:outline-none focus:border-black focus:bg-white"
          />
        </div>

        <div>
          <label class="block mb-2 text-base font-semibold text-gray-800">Category</label>
          <select 
            v-model="category" 
            class="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-base focus:outline-none focus:border-black focus:bg-white"
          >
            <option disabled value="">-- Select Category --</option>
            <option>Local News</option>
            <option>Global News</option>
            <option>Business News</option>
            <option>Sport News</option>
            <option>Entertainment News</option>
          </select>
        </div>

        <div>
          <label class="block mb-2 text-base font-semibold text-gray-800">Image URL</label>
          <input 
            type="url" 
            v-model="image" 
            placeholder="https://" 
            class="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-base focus:outline-none focus:border-black focus:bg-white"
          />
        </div>

        <div>
          <label class="block mb-2 text-base font-semibold text-gray-800">Reporter</label>
          <input 
            type="text" 
            v-model="reporter" 
            placeholder="Enter Reporter Name"
            class="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-base focus:outline-none focus:border-black focus:bg-white"
          />
        </div>

        <div class="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
          <div class="flex-1">
            <label class="block mb-2 text-base font-semibold text-gray-800">Date</label>
            <input 
              type="date" 
              class="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-base focus:outline-none focus:border-black focus:bg-white"
            />
          </div>
          <div class="flex-1">
            <label class="block mb-2 text-base font-semibold text-gray-800">Time</label>
            <input 
              type="time" 
              class="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-base focus:outline-none focus:border-black focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label class="block mb-2 text-base font-semibold text-gray-800">Detail</label>
          <textarea 
            v-model="detail" 
            rows="3" 
            placeholder="Enter Detail"
            class="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-base focus:outline-none focus:border-black focus:bg-white"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-between mt-8">
        <button 
          type="submit" 
          class="w-28 h-10 rounded-md font-semibold bg-black text-white hover:bg-gray-800 transition"
        >
          Upload
        </button>
        <button 
          type="reset" 
          class="w-28 h-10 rounded-md font-semibold bg-white border border-black text-black hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>

    <div class="mt-8 ml-[50px]">
    <RouterLink to="/" class="flex items-center justify-center w-[150px] h-[40px] bg-black text-white rounded hover:bg-gray-800 transition">
      ← back to home
    </RouterLink>
  </div>
</template>
