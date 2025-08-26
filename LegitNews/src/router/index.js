import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NewsDetailView from '@/views/NewsDetailView.vue'
import VoteCommentView from '@/views/VoteCommentView.vue'
import AddNewsView from '@/views/AddNewsView.vue'
import AboutUs from '@/views/AboutUs.vue'
import Term from '@/views/Term.vue'

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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
