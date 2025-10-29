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
  { path: '/login',    name: 'login',    component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/profile',  name: 'profile',  component: ProfileView },

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
  return true
})

export default router
