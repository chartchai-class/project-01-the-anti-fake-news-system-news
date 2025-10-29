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
    component: AddNewsView 
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
    component: AdminDashboard
  },  
  {
    path: '/admin/manage-user',
    name: 'admin-manage-user',
    component: AdminManageUser
  },
  {
    path: '/admin/manage-comment',
    name: 'admin-manage-comment',
    component: AdminManageComment
  },
  {
    path: '/admin/manage-news',
    name: 'admin-manage-news',
    component: AdminManageNews
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
