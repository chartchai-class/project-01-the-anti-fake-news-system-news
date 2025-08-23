import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NewsDetailView from '@/views/NewsDetailView.vue'
import VoteCommentView from '@/views/VoteCommentView.vue'
import AddNewsView from '@/views/AddNewsView.vue'

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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
