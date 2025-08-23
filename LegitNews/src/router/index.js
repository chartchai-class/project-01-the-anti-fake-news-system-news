import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NewsDetailView from '@/views/NewsDetailView.vue'
import VoteCommentView from '@/views/VoteCommentView.vue'
import AddNewsView from '@/views/AddNewsView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'

const routes = [
  { path: '/', 
    name: 'home', 
    component: HomeView 
  },
  { path: '/news/:id',
     name: 'news-detail',
     component: NewsDetailView 
  },
  {
    path: '/news/:id/viewcomment',
    name: 'view-comment',
    component: VoteCommentView
  },
  { path: '/news/:id/vote', 
    name: 'vote-comment', 
    component: VoteCommentView 
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
