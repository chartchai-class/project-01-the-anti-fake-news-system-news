<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
// The tab logic remains the same (defaults to 'all', uses 'pending' query for the second tab)
const currentTab = computed(() => route.query.tab === 'pending' ? 'pending' : 'all');
const searchQuery = ref('');
const isLoading = ref(false); 

const allUsersData = ref([
    { id: 1, name: 'Carol White', email: 'carol@example.com', role: 'member', joinDate: '2025-10-20', newsSubmitted: 15, comments: 45, initials: 'CW' },
    { id: 2, name: 'David Lee', email: 'david@example.com', role: 'member', joinDate: '2025-10-18', newsSubmitted: 12, comments: 32, initials: 'DL' },
    { id: 3, name: 'Emma Davis', email: 'emma@example.com', role: 'reader', joinDate: '2025-10-27', newsSubmitted: 0, comments: 5, initials: 'ED' },
    { id: 4, name: 'Frank Wilson', email: 'frank@example.com', role: 'reader', joinDate: '2025-10-26', newsSubmitted: 0, comments: 2, initials: 'FW' },
    { id: 5, name: 'Grace Hall', email: 'grace@example.com', role: 'reader', joinDate: '2025-10-25', newsSubmitted: 0, comments: 0, initials: 'GH' },
    // Pending users 
    { id: 6, name: 'Alice Cooper', email: 'alice@example.com', role: 'reader', joinDate: '2025-10-25', newsSubmitted: 5, comments: 12, initials: 'AC', request: 'member' },
    { id: 7, name: 'Bob Martin', email: 'bob@example.com', role: 'reader', joinDate: '2025-10-26', newsSubmitted: 3, comments: 8, initials: 'BM', request: 'member' },
]);


const pendingRequests = computed(() => {
    return allUsersData.value.filter(user => user.request === 'member');
});

const activeUsers = computed(() => {
    return allUsersData.value.filter(user => !user.request);
});

const usersToShow = computed(() => {
    return currentTab.value === 'pending' ? pendingRequests.value : activeUsers.value;
});

const filteredUsers = computed(() => {
    const term = searchQuery.value.toLowerCase().trim();
    if (!term) return usersToShow.value;

    return usersToShow.value.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
});

function changeTab(tab) {
    if (tab !== currentTab.value) {
        searchQuery.value = '';
        isLoading.value = true;
        // Pushes the tab query to the URL
        router.push({ query: { tab: tab === 'all' ? undefined : 'pending' } });
        setTimeout(() => {
            isLoading.value = false;
        }, 500);
    }
}

function handleApprove(userId) {
    const user = allUsersData.value.find(u => u.id === userId);
    if (user && user.request === 'member') {
        console.log(`Approving membership request for: ${user.name}`);
        user.role = 'member';
        user.request = undefined;
    }
}

function handleReject(userId) {
    const user = allUsersData.value.find(u => u.id === userId);
    if (user && user.request === 'member') {
        console.log(`Rejecting membership request for: ${user.name}`);
        user.request = undefined;
    }
}

function viewUserDetail(userId) {
    console.log(`Viewing detail for user ID: ${userId}`);
}

function getRoleClass(role) {
    return role === 'member' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700';
}

function getAvatarBgClass(name) {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-amber-500', 'bg-cyan-500'];
    return colors[hash % colors.length];
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

watch(
    () => route.query.tab,
    (newTab, oldTab) => {
        if (newTab !== oldTab) {
            searchQuery.value = '';
        }
    }
);
</script>

<template>
<div class="sm:p-8 min-h-screen font-inter">
    <div class="max-w-[1200px] mx-auto">
        <div class="flex items-center space-x-4 mb-6 border-b border-gray-200">
            <button
                @click="changeTab('all')"
                :class="[
                    'py-2 px-4 transition-colors duration-200',
                    currentTab === 'all' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'
                ]"
            >
                All Users
            </button>
            <button
                @click="changeTab('pending')"
                :class="[
                    'py-2 px-4 transition-colors duration-200 flex items-center',
                    currentTab === 'pending' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'
                ]"
            >
                Member Requests
                <span v-if="pendingRequests.length > 0" class="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {{ pendingRequests.length }}
                </span>
            </button>
        </div>

        <div class="mb-6">
            <div class="relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                    type="text"
                    v-model="searchQuery"
                    :placeholder="currentTab === 'pending' ? 'Search member requests by name or email...' : 'Search users by name or email...'"
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150"
                />
            </div>
        </div>

        <div v-if="isLoading" class="flex justify-center items-center min-h-[300px] bg-white rounded-xl shadow-lg">
            <div class="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        <div v-else class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr v-if="currentTab === 'all'">
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Role</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Join Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">News Submitted</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Comments</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 tracking-wider">Actions</th>
                    </tr>
                    <tr v-else>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Request Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">News Submitted</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Comments</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-if="filteredUsers.length === 0">
                        <td :colspan="currentTab === 'pending' ? 6 : 7" class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            No {{ currentTab === 'pending' ? 'member requests' : 'users' }} found.
                        </td>
                    </tr>

                    <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 transition duration-150">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div :class="[getAvatarBgClass(user.name), 'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm']">
                                    {{ getInitials(user.name) }}
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                                    <div v-if="user.request === 'member' && currentTab === 'pending'" class="text-xs text-gray-500 flex items-center">
                                        Reader 
                                        <svg class="w-3 h-3 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg> 
                                        Member
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ user.email }}</td>
                        
                        <template v-if="currentTab === 'pending'">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.joinDate }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.newsSubmitted }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.comments }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div class="flex justify-center space-x-2">
                                    <button @click="handleApprove(user.id)" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150">
                                        <svg class="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        Approve
                                    </button>
                                    <button @click="handleReject(user.id)" class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150">
                                        <svg class="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        Reject
                                    </button>
                                </div>
                            </td>
                        </template>

                        <template v-else>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span :class="[getRoleClass(user.role), 'px-3 inline-flex text-xs leading-5 font-semibold rounded-full capitalize']">
                                    {{ user.role }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.joinDate }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.newsSubmitted }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.comments }}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <button @click="viewUserDetail(user.id)" class="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition duration-150">
                                    <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
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