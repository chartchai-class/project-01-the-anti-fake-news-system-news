<script setup>
import { ref } from 'vue'
import { useNewsStore } from '@/stores/newsStore'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { uploadNewsImage } from '@/lib/firebaseUpload'

const store = useNewsStore()
const auth  = useAuthStore()
auth.init()
const router = useRouter()

const headline = ref("")
const detail   = ref("")
const reporter = ref("")
const imageUrl = ref("")        // keep your existing URL box
const imageFile = ref(null)     // new: optional file
const category = ref("Local News")

function onPickFile(e) {
  const f = e?.target?.files?.[0]
  imageFile.value = f || null
}

async function submitNews() {

  if (!auth.isLoggedIn || !['member', 'admin'].includes(auth.role)) {
    alert('Only logged-in Member accounts can add news.')
    return
  }

  if (!headline.value || !detail.value || !category.value) {
    alert("⚠️ Headline, Detail and Category are required.")
    return
  }

  let finalImageUrl = imageUrl.value?.trim() || ""

  // if a file is provided, upload to Firebase and use that URL
  if (imageFile.value) {
    try {
      finalImageUrl = await uploadNewsImage(imageFile.value, category.value)
    } catch (e) {
      console.error(e)
      alert("Image upload failed.")
      return
    }
  }

  const payload = {
    category: category.value,
    headline: headline.value,
    details:  detail.value,
    reporter: reporter.value || "Anonymous",
    dateTime: new Date().toISOString(),
    imageUrl: finalImageUrl || "",             // backend will pass-through http(s) or resolve path
  }

  // attach creator user if available
  if (auth.currentUser?.id) {
    payload.createdById = auth.currentUser.id
    payload.createdByRole = auth.role
  }

  try {
    const created = await store.createNews(payload)
    // refresh list so the new item from backend appears
    await store.fetchNews()

    // clear form
    headline.value = ""
    detail.value   = ""
    reporter.value = ""
    imageUrl.value = ""
    imageFile.value = null
    category.value = "Local News"

    alert("✅ News added successfully!")
    router.push('/')
  } catch (e) {
    console.error(e)
    alert("Failed to create news.")
  }
}
</script>


<template>
  <div class="bg-white w-[calc(100%-100px)] mx-[50px] mt-12 mb-12 rounded-xl shadow-lg overflow-hidden">
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
          <label class="block mb-2 text-base font-semibold text-gray-800">Image File (Optional)</label>
          <input 
            type="file" 
            accept="image/*"
            @change="onPickFile"
            class="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-base focus:outline-none focus:border-black focus:bg-white"
          />
          <p class="text-xs text-gray-500 mt-1">If a file is selected, the file will be uploaded and used instead of the URL above.</p>
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

  <div class="mt-8 mb-8 mx-[50px]">
    <RouterLink to="/"class="flex items-center justify-center w-[150px] h-[40px] bg-white text-black border border-gray-400 rounded hover:bg-gray-100 transition">
      Back to home
    </RouterLink>
  </div>

</template>
