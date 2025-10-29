<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const currentTab = computed(() => route.query.tab === 'deleted' ? 'deleted' : 'active');
const searchQuery = ref('');
const selectedCategory = ref('All News'); 
const selectedStatus = ref('Status'); 
const isLoading = ref(false);

const categories = ['All News', 'Local', 'Global', 'Business', 'Sports', 'Entertainment'];
const statuses = ['Status', 'All News', 'Verified News', 'Fake News']; 

const activeNewsData = ref([
    { id: 1, title: 'Breaking: New Climate Agreement Signed', author: 'Reuters', submittedBy: 'John Doe', category: 'Local', date: '2025-10-27', status: 'Verified', views: 1234 },
    { id: 2, title: 'Miracle Cure Found for All Diseases', author: 'Unknown', submittedBy: 'Jane Smith', category: 'Global', date: '2025-10-26', status: 'Fake', views: 856 },
    { id: 3, title: 'Tech Giant Announces New Innovation', author: 'TechNews', submittedBy: 'Mike Johnson', category: 'Business', date: '2025-10-27', status: 'Verified', views: 542 },
    { id: 4, title: 'Local Sports Team Wins Championship', author: 'ESPN', submittedBy: 'Sarah Wilson', category: 'Sports', date: '2025-10-25', status: 'Verified', views: 2105 },
    { id: 5, title: 'Celebrity Spotted with Alien', author: 'GossipNews', submittedBy: 'Tom Brown', category: 'Entertainment', date: '2025-10-24', status: 'Fake', views: 3421 },
]);

const deletedNewsHistory = ref([
    { 
        id: 101, title: 'Old News Article on Economy', author: 'BusinessDaily', deletedBy: 'Admin', deletedDate: '2025-10-20', reason: 'Outdated', 
        originalItem: { id: 101, title: 'Old News Article on Economy', author: 'BusinessDaily', submittedBy: 'System', category: 'Business', date: '2025-10-20', status: 'Verified', views: 50 }
    },
    { 
        id: 102, title: 'Controversial Opinion Piece', author: 'OpinionWriter', deletedBy: 'Admin', deletedDate: '2025-10-18', reason: 'Policy Violation',
        originalItem: { id: 102, title: 'Controversial Opinion Piece', author: 'OpinionWriter', submittedBy: 'System', category: 'Global', date: '2025-10-18', status: 'Fake', views: 1500 }
    },
]);

const newsToShow = computed(() => {
    return currentTab.value === 'deleted' ? deletedNewsHistory.value : activeNewsData.value;
});

const filteredNews = computed(() => {
    let filtered = newsToShow.value;
    const term = searchQuery.value.toLowerCase().trim();

    if (term) {
        filtered = filtered.filter(news =>
            news.title.toLowerCase().includes(term) ||
            news.author.toLowerCase().includes(term)
        );
    }

    if (currentTab.value === 'active' && selectedCategory.value !== 'All News') {
        filtered = filtered.filter(news => news.category === selectedCategory.value);
    }

    if (currentTab.value === 'active' && selectedStatus.value !== 'Status' && selectedStatus.value !== 'All News') {
        const filterStatus = selectedStatus.value === 'Verified News' ? 'Verified' :
                             selectedStatus.value === 'Fake News' ? 'Fake' : null;
        
        if (filterStatus) {
            filtered = filtered.filter(news => news.status === filterStatus);
        }
    }

    return filtered;
});

function changeTab(tab) {
    if (tab !== currentTab.value) {
        searchQuery.value = ''; 
        selectedCategory.value = 'All News'; 
        selectedStatus.value = 'Status'; 
        isLoading.value = true;
        router.push({ query: { tab: tab === 'active' ? undefined : 'deleted' } });
        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    }
}

function handleViewNews(newsId) {
    console.log(`Viewing news details for ID: ${newsId}`);
}

function handleEditNews(newsId) {
    console.log(`Editing news with ID: ${newsId}`);
}

function handleDeleteNews(newsId, newsTitle, reason = 'Admin Deletion') {
    const index = activeNewsData.value.findIndex(n => n.id === newsId);

    if (index !== -1) {
        const newsItem = activeNewsData.value[index];
        console.log(`Deleting news ID ${newsId}: "${newsTitle}"`);

        deletedNewsHistory.value.unshift({
            id: newsItem.id,
            title: newsItem.title,
            author: newsItem.author,
            deletedBy: 'Admin', 
            deletedDate: new Date().toISOString().split('T')[0],
            reason: reason,
            originalItem: newsItem, 
        });
        activeNewsData.value.splice(index, 1);
    }
}

function handleUndoDelete(newsId) {
    const index = deletedNewsHistory.value.findIndex(n => n.id === newsId);

    if (index !== -1) {
        const deletedItem = deletedNewsHistory.value[index];
        
        if (deletedItem.originalItem) {
            activeNewsData.value.unshift(deletedItem.originalItem);
            console.log(`Undoing deletion for ID: ${newsId}. News restored to active list.`);
        } else {
            console.warn(`Cannot fully restore ID: ${newsId}. Original item data missing.`);
        }
        
        deletedNewsHistory.value.splice(index, 1);
    }
}

function handlePurgeNews(newsId) {
    const index = deletedNewsHistory.value.findIndex(n => n.id === newsId);
    if (index !== -1) {
        console.log(`Permanently purging news ID ${newsId} from history.`);
        deletedNewsHistory.value.splice(index, 1);
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'Verified': return 'bg-green-100 text-green-800';
        case 'Fake': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-700';
    }
}

watch(
    () => route.query.tab,
    (newTab, oldTab) => {
        if (newTab !== oldTab) {
            searchQuery.value = '';
            selectedCategory.value = 'All News';
            selectedStatus.value = 'Status';
        }
    }
);
</script>

<template>
    <div class="sm:p-8 min-h-screen font-inter">
        <div class="max-w-[1200px] mx-auto">
            <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-2">
                <div class="flex items-center space-x-4 mb-4 sm:mb-0 overflow-x-auto whitespace-nowrap">
                    <button
                        @click="changeTab('active')"
                        :class="[
                            'py-2 px-4 transition-colors duration-200',
                            currentTab === 'active' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'
                        ]"
                    >
                        Active News
                    </button>
                    <button
                        @click="changeTab('deleted')"
                        :class="[
                            'py-2 px-4 transition-colors duration-200',
                            currentTab === 'deleted' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'
                        ]"
                    >
                        Delete History
                    </button>
                </div>

                <div class="flex space-x-4">
                    <template v-if="currentTab === 'active'">
                        <select v-model="selectedCategory" class="h-10 px-3 py-1 text-sm border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 ml-4 hidden md:block">
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>

                        <select v-model="selectedStatus" class="h-10 px-3 py-1 text-sm border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 hidden md:block">
                            <option v-for="stat in statuses" :key="stat" :value="stat">{{ stat }}</option>
                        </select>
                    </template>

                    <div class="w-full sm:w-auto">
                        <RouterLink to="/add-news">
                            <button class="w-full sm:w-auto bg-black text-white text-base font-semibold px-4 py-2 rounded cursor-pointer hover:bg-gray-800">
                                Add News
                            </button>
                        </RouterLink>
                    </div>
                </div> 
            </div>
            
            <!-- Mobile Filters -->
            <div v-if="currentTab === 'active'" class="flex gap-4 mb-6 md:hidden">
                <select v-model="selectedCategory" class="w-1/2 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150">
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>

                <select v-model="selectedStatus" class="w-1/2 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150">
                    <option v-for="stat in statuses" :key="stat" :value="stat">{{ stat }}</option>
                </select>
            </div>
            
            <!-- Search Bar -->
            <div class="mb-6">
                <div class="relative flex-grow">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        v-model="searchQuery"
                        placeholder="Search news by title or author..."
                        class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
                    />
                </div>
            </div>

            <div v-if="isLoading" class="flex justify-center items-center min-h-[300px] bg-white rounded-xl shadow-lg">
                <div class="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>

            <div v-else class="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-100">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr v-if="currentTab === 'active'">
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-2/12">Title</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/12">Author</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/12">Submitted By</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/12">Category</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/12">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/12">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-1/12">Views</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 tracking-wider w-2/12">Actions</th>
                        </tr>
                        <tr v-else>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-3/12">Title</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-2/12">Author</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-2/12">Deleted By</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-2/12">Deleted Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider w-2/12">Reason</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 tracking-wider w-1/12">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-if="filteredNews.length === 0">
                            <td :colspan="currentTab === 'active' ? 8 : 6" class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                No {{ currentTab === 'active' ? 'active news articles' : 'deleted news items' }} found matching your filters.
                            </td>
                        </tr>

                        <tr v-for="news in filteredNews" :key="news.id" class="hover:bg-gray-50 transition duration-150">
                            <td class="px-6 py-4 text-sm font-medium text-gray-900 max-w-[300px] truncate">{{ news.title }}</td>
                            
                            <template v-if="currentTab === 'active'">
                                <!-- Active News Columns -->
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ news.author }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ news.submittedBy }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-3 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-700">
                                        {{ news.category }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ news.date }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span :class="[getStatusClass(news.status), 'px-3 inline-flex text-xs leading-5 font-semibold rounded-full flex items-center gap-1']">
                                        <!-- Status Icon: Changed 'Real' to 'Verified' for alignment with status list -->
                                        <svg v-if="news.status === 'Verified'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <svg v-if="news.status === 'Fake'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        {{ news.status }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ news.views }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div class="flex justify-center space-x-2">
                                        <button @click="handleViewNews(news.id)" title="View Details" class="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition duration-150">
                                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        </button>
                                        <button @click="handleEditNews(news.id)" title="Edit News" class="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-100 transition duration-150">
                                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button @click="handleDeleteNews(news.id, news.title)" title="Delete News" class="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition duration-150">
                                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </template>

                            <template v-else>
                                <!-- Deleted History Columns -->
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ news.author }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ news.deletedBy }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ news.deletedDate }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ news.reason }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div class="flex justify-center space-x-2">
                                        <button @click="handleViewNews(news.id)" title="View Details" class="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition duration-150">
                                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        </button>
                                        
                                        <!-- NEW UNDO BUTTON -->
                                        <button @click="handleUndoDelete(news.id)" title="Undo Deletion (Restore)" class="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-100 transition duration-150">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 0h-4m-7 8l-2-2m0 0l-2 2m2-2v6"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="!isLoading" class="text-center my-5 text-base flex justify-center items-center gap-4">
            <span
                @click="prevPage"
                :class="['cursor-pointer select-none', currentPage === 1 ? 'opacity-40 cursor-not-allowed' : '']">&lt;
            </span>
            <span>Page {{ currentPage }} / {{ totalPages }}</span>
            <span
                @click="nextPage"
                :class="['cursor-pointer select-none', currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : '']">&gt;
            </span>
            </div>
        </div>
</template>

<style>
/* Basic styling for Inter font if not globally available */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
.font-inter {
    font-family: 'Inter', sans-serif;
}
</style>
