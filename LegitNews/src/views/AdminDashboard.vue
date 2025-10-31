<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router'; 
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
const api = axios.create({ baseURL: `${API_BASE}/api` })

const stats = ref([
    { title: 'Total News', value: '0', change: '+0%', iconBgClass: 'bg-amber-500', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>', to: { path: '/', query: { status: 'all' } } },
    { title: 'Verified News', value: '0', change: '+0%', iconBgClass: 'bg-green-500', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>', to: { path: '/', query: { type: 'real' } } },
    { title: 'Fake News', value: '0', change: '+0%', iconBgClass: 'bg-red-500', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>', to: { path: '/', query: { type: 'fake' } } },
    { title: 'Total Users', value: '0', change: '+0%', iconBgClass: 'bg-blue-500', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>', to: '/admin/manage-user' },
    { title: 'Members', value: '0', change: '+0%', iconBgClass: 'bg-purple-500', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 3v18"></path><path d="M3 9h18"></path><path d="M3 15h18"></path></svg>', to: '/admin/manage-user' },
    { title: 'Readers', value: '0', change: '+0%', iconBgClass: 'bg-cyan-500', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>', to: '/admin/manage-user' },
]);

const recentActivity = ref([]);

// Mock data for top contributors (always use this)
const topContributors = ref([
    { name: 'Alice Cooper', submissions: 45, accuracy: 92, avatarBgClass: 'bg-purple-500' },
    { name: 'Bob Martin', submissions: 38, accuracy: 89, avatarBgClass: 'bg-blue-500' },
    { name: 'Charlie Green', submissions: 31, accuracy: 85, avatarBgClass: 'bg-green-500' },
    { name: 'Diana Prince', submissions: 27, accuracy: 81, avatarBgClass: 'bg-red-500' },
]);

const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

async function fetchDashboardData() {
    try {
        // Fetch all news
        const newsRes = await api.get('/admin/news', { params: { status: 'all', page: 0, size: 1000 } })
        const allNews = newsRes.data.content || []
        
        const totalNews = allNews.length
        const verifiedNews = allNews.filter(n => n.votesReal > n.votesFake).length
        const fakeNews = allNews.filter(n => n.votesFake >= n.votesReal).length
        
        // Fetch all users
        const usersRes = await api.get('/admin/users')
        const allUsers = usersRes.data || []
        
        const totalUsers = allUsers.length
        const members = allUsers.filter(u => u.role === 'MEMBER').length
        const readers = allUsers.filter(u => u.role === 'READER').length
        
        // Update stats
        stats.value[0].value = totalNews.toString()
        stats.value[1].value = verifiedNews.toString()
        stats.value[2].value = fakeNews.toString()
        stats.value[3].value = totalUsers.toString()
        stats.value[4].value = members.toString()
        stats.value[5].value = readers.toString()
        
        // Recent activity
        const recentNews = allNews
            .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
            .slice(0, 5)
        
        recentActivity.value = recentNews.map(n => {
            const isReal = n.votesReal > n.votesFake
            return {
                type: isReal ? 'News verified as REAL' : 'News marked as FAKE',
                user: n.reporter || 'Unknown',
                time: getRelativeTime(n.dateTime),
                statusClass: isReal ? 'text-green-500' : 'text-red-500'
            }
        })
        
    } catch (e) {
        console.error('Failed to fetch dashboard data:', e)
        setMockData()
    }
}

function setMockData() {
    stats.value[0].value = '116'
    stats.value[1].value = '100'
    stats.value[2].value = '16'
    stats.value[3].value = '1,234'
    stats.value[4].value = '780'
    stats.value[5].value = '454'
    
    recentActivity.value = [
        { type: 'News verified as REAL', user: 'John Doe', time: '2 minutes ago', statusClass: 'text-green-500' },
        { type: 'News marked as FAKE', user: 'Jane Smith', time: '15 minutes ago', statusClass: 'text-red-500' },
        { type: 'New user registered', user: 'Bob Johnson', time: '30 minutes ago', statusClass: 'text-blue-500' },
        { type: 'Report pending review', user: 'Alice Cooper', time: '1 hour ago', statusClass: 'text-amber-500' },
        { type: 'News verified as REAL', user: 'Mike Ross', time: '2 hours ago', statusClass: 'text-green-500' },
    ]
}

function getRelativeTime(dateTime) {
    if (!dateTime) return 'Unknown'
    const now = new Date()
    const past = new Date(dateTime)
    const diffMs = now - past
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

onMounted(() => {
    fetchDashboardData()
})
</script>

<template>
    <div class="min-h-screen font-inter sm:p-8">
        <div class="max-w-7xl mx-auto w-full" style="max-width: 1200px;">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <RouterLink
                    v-for="(stat, index) in stats"
                    :key="index"
                    :to="stat.to"
                    class="no-underline text-inherit block"
                >
                    <div
                        class="bg-white p-6 rounded-xl shadow-lg transition duration-300 hover:shadow-xl hover:translate-y-[-2px] border border-gray-100 cursor-pointer"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex flex-col">
                                <span class="text-gray-500 font-medium text-sm">{{ stat.title }}</span>
                                <span class="text-3xl font-extrabold text-gray-900 mt-1">{{ stat.value }}</span>
                                <!-- Removed the change line -->
                            </div>
                            <div :class="[stat.iconBgClass, 'p-4 rounded-xl text-white shadow-md']" v-html="stat.icon"></div>
                        </div>
                    </div>
                </RouterLink>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
                    <ul class="space-y-4">
                        <li v-for="(activity, index) in recentActivity" :key="index" class="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                            <div class="flex items-start justify-between">
                                <div class="flex items-center">
                                    <span :class="[activity.statusClass, 'h-2 w-2 rounded-full mr-3 mt-1 flex-shrink-0']"></span>
                                    <div>
                                        <p class="text-gray-700 font-medium text-base">{{ activity.type }}</p>
                                        <p class="text-sm text-gray-500">by {{ activity.user }}</p>
                                    </div>
                                </div>
                                <span class="text-xs text-gray-400 font-light whitespace-nowrap">{{ activity.time }}</span>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h2 class="text-xl font-semibold text-gray-800 mb-4">Top Contributors</h2>
                    <ul class="space-y-4">
                        <li v-for="(contributor, index) in topContributors" :key="index" class="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                            <div class="flex items-center">
                                <div 
                                    :class="[contributor.avatarBgClass, 'w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-sm mr-4 flex-shrink-0']"
                                >
                                    {{ getInitials(contributor.name) }}
                                </div>
                                <div>
                                    <p class="text-gray-800 font-medium">{{ contributor.name }}</p>
                                    <p class="text-sm text-gray-500">{{ contributor.submissions }} submissions</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="text-sm font-bold text-green-600">{{ contributor.accuracy }}%</span>
                                <p class="text-xs text-gray-400">accuracy</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
.font-inter {
    font-family: 'Inter', sans-serif;
}
</style>
