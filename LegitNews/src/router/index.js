import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NewsDetailView from '@/views/NewsDetailView.vue'
import VoteCommentView from '@/views/VoteCommentView.vue'
import AddNewsView from '@/views/AddNewsView.vue'
import AboutUs from '@/views/AboutUs.vue'
import Term from '@/views/Term.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'
import { useAuthStore } from '@/stores/authStore'

import AdminDashboard from '@/views/AdminDashboard.vue'
import AdminManageUser from '@/views/AdminManageUser.vue'
import AdminManageComment from '@/views/AdminManageComment.vue'
import AdminManageNews from '@/views/AdminManageNews.vue'

const routes = [
  { path: '/', 
    name: 'home', 
    component: HomeView 
  },
  { path: '/news/:id',
     name: 'news-detail',
     component: NewsDetailView 
  },
  { path: '/add-news', 
    name: 'add-news', 
    component: AddNewsView,
    meta: { requiresMember: true } 
  },
  {
  path: '/category/:name',
  name: 'category-news',
  component: HomeView 
  },
  {
  path: '/search/:term',
  name: 'search-news',
  component: HomeView 
  },
  { path: '/about', 
    name: 'AboutUs', 
    component: AboutUs 
  },
   {
    path: '/terms',
    name: 'Terms',
    component: Term
  },
  { path: '/login',    
    name: 'login',    
    component: LoginView 
  },
  { path: '/register', 
    name: 'register', 
    component: RegisterView 
  },
  { path: '/profile',  
    name: 'profile',  
    component: ProfileView 
  },
  { 
    path: '/admin/dashboard', 
    name: 'admin-dashboard', 
    component: AdminDashboard,
     meta: { requiresAdmin: true }
  },  
  {
    path: '/admin/manage-user',
    name: 'admin-manage-user',
    component: AdminManageUser,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/manage-comment',
    name: 'admin-manage-comment',
    component: AdminManageComment,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/manage-news',
    name: 'admin-manage-news',
    component: AdminManageNews,
    meta: { requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.init()
  if (to.meta?.requiresMember) {
    if (!auth.isLoggedIn) {
      alert('Please log in to add news.')
      return { name: 'login' }
    }
    if (auth.role !== 'member') {
      alert('Only Member accounts can add news.')
      return false // block navigation
    }
  }

  if (to.meta?.requiresAdmin) {
    if (!auth.isLoggedIn) { alert('Please log in.'); return { name: 'login' } }
    if (auth.role !== 'admin') { alert('Admins only.'); return false }
  }
  return true
})

export default router
