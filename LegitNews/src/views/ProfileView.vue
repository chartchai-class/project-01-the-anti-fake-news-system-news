<script setup>
import { computed, ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()
const isLoading = ref(true)
const user = computed(() => auth.currentUser)

onMounted(async () => {
  await auth.init()
  isLoading.value = false
})

function applyMembership() {
  if (!user.value) return
  if (user.value.role?.toLowerCase() === 'member') {
    alert('You are already a member!')
    return
  }
  auth.applyForMembership?.()
}

function logout() {
  auth.logout()
  router.push('/login')
}

function getRoleClass(role) {
  if (!role) return 'bg-gray-100 text-gray-700'
  const r = role.toLowerCase()
  if (r === 'admin') return 'bg-purple-100 text-purple-800'
  if (r === 'member') return 'bg-blue-100 text-blue-800'
  return 'bg-gray-100 text-gray-700'
}

// Mock news (4 items)
const allNews = ref([
  {
    id: 1,
    category: 'Local',
    headline: 'Breaking News 1',
    detail: 'Details of breaking news 1...',
    reporter: 'John Doe',
    date: '2025-10-30 10:00',
    image: 'https://via.placeholder.com/300x150',
    votes: { real: 12, fake: 2 }
  },
  {
    id: 2,
    category: 'International',
    headline: 'Breaking News 2',
    detail: 'Details of breaking news 2...',
    reporter: 'Jane Smith',
    date: '2025-10-29 12:30',
    image: 'https://via.placeholder.com/300x150',
    votes: { real: 5, fake: 8 }
  },
  {
    id: 3,
    category: 'Politics',
    headline: 'Breaking News 3',
    detail: 'Details of breaking news 3...',
    reporter: 'Alice Johnson',
    date: '2025-10-28 15:45',
    image: 'https://via.placeholder.com/300x150',
    votes: { real: 20, fake: 0 }
  },
  {
    id: 4,
    category: 'Sports',
    headline: 'Breaking News 4',
    detail: 'Details of breaking news 4...',
    reporter: 'Bob Lee',
    date: '2025-10-27 09:15',
    image: 'https://via.placeholder.com/300x150',
    votes: { real: 3, fake: 7 }
  }
])

const filterType = ref('all')
const sortOrder = ref('newest')
const startDate = ref('')
const endDate = ref('')
const filteredNews = computed(() => {
  let list = [...allNews.value]

  if (filterType.value === 'real') {
    list = list.filter(n => n.votes.real > n.votes.fake)
  } else if (filterType.value === 'fake') {
    list = list.filter(n => n.votes.fake >= n.votes.real)
  }

  if (startDate.value) {
    list = list.filter(n => new Date(n.date) >= new Date(startDate.value))
  }
  if (endDate.value) {
    list = list.filter(n => new Date(n.date) <= new Date(endDate.value))
  }

  list.sort((a, b) => {
    const da = new Date(a.date)
    const db = new Date(b.date)
    return sortOrder.value === 'newest' ? db - da : da - db
  })

  return list
})

const categoryLabel = computed(() => 'All News')
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-4 py-6">
    <!-- Profile Card -->
    <div v-if="!isLoading && user" class="bg-white rounded-xl shadow p-6 mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-6">
          <img
            v-if="user.photoUrl"
            :src="user.photoUrl"
            alt="profile"
            class="h-32 w-32 rounded-lg object-cover border"
          />
          <div
            v-else
            class="h-32 w-32 rounded-lg bg-gray-900 text-white flex items-center justify-center text-4xl font-bold"
          >
            {{ (user.name?.[0] || 'U') + (user.surname?.[0] || '') }}
          </div>
          <div>
            <div class="text-3xl font-bold">{{ user.name }} {{ user.surname }}</div>
            <div class="text-lg text-gray-600 mt-1">Email: {{ user.email }}</div>
            <div class="text-lg mt-2">
              Status:
              <span
                :class="[getRoleClass(user.role), 'ml-2 px-4 py-1 inline-flex text-sm leading-6 font-semibold rounded-full capitalize']"
              >
                {{ user.role || 'Reader' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap justify-between mt-6">
        <div class="flex gap-3">
          <RouterLink
            to="/"
            class="px-4 py-2 rounded border border-gray-400 bg-white hover:bg-gray-100 transition"
          >
            Back to Home
          </RouterLink>

          <button
            @click="applyMembership"
            class="px-4 py-2 rounded border border-gray-400 bg-white hover:bg-gray-100 transition"
          >
            Apply Membership
          </button>
        </div>

        <div>
          <button
            @click="logout"
            class="px-4 py-2 rounded border border-black bg-black text-white hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="!isLoading && !user" class="bg-white rounded-xl shadow p-6 text-center">
      <p class="mb-3 text-lg">You are not logged in.</p>
      <RouterLink to="/login" class="text-lg underline hover:text-blue-600 transition">
        Login to your account
      </RouterLink>
    </div>

    <!-- Mock News Section -->
    <div v-if="!isLoading" class="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto mt-8">
      <RouterLink
        v-for="news in filteredNews"
        :key="news.id"
        :to="`/news/${news.id}`"
        class="no-underline text-inherit"
      >
        <div class="w-full bg-white rounded-lg shadow-md overflow-hidden relative hover:shadow-lg transition">
          <div class="h-[150px] overflow-hidden">
            <img :src="news.image" alt="news image" class="w-full h-full object-cover" />
          </div>

          <span
            class="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white"
            :class="news.votes.real > news.votes.fake ? 'bg-green-600' : 'bg-red-500'"
          >
            {{ news.votes.real > news.votes.fake ? 'Verified' : 'Fake' }}
          </span>

          <div class="p-3">
            <div class="font-bold my-1">{{ news.headline }}</div>
            <p class="text-sm">{{ news.detail.substring(0, 80) }}...</p>

            <div class="flex justify-between text-[13px] text-gray-600 mt-2">
              <div>Reporter: {{ news.reporter }}</div>
              <div>{{ news.date }}</div>
            </div>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
