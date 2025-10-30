// src/stores/newsStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
const api = axios.create({
  baseURL: `${API_BASE}/api` 
});

export const useNewsStore = defineStore('news', {
  state: () => ({
    newsList: [],
    error: null,
    loading: false
  }),

  getters: {
    allNews: (state) => state.newsList
  },

  actions: {
    saveLocal(newsList) {
      localStorage.setItem("extraNews", JSON.stringify(newsList))
    },
    loadLocal() {
      try {
        return JSON.parse(localStorage.getItem("extraNews") || "[]")
      } catch {
        return []
      }
    },

    addNews(news) {
      this.newsList.unshift(news)

      const local = this.loadLocal()
      local.unshift(news)
      this.saveLocal(local)
    },

    loadDummyNews() {
      this.newsList = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        category: "Local News",
        headline: `Sample Headline ${i + 1}`,
        detail: `This is the full detail for news item ${i + 1}.`,
        reporter: i % 3 === 0 ? "Anonymous" : `Reporter ${i + 1}`,
        date: `2025-08-17 ${10 + (i % 12)}:00`,
        image: "https://via.placeholder.com/150",
        votes: { real: Math.floor(Math.random() * 20), fake: Math.floor(Math.random() * 20) },
        comments: []
      }))
    },

    async fetchNews() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get("/news", { params: { page: 0, size: 1000 } })
        const page = res.data
        const raw = Array.isArray(page?.content) ? page.content : (Array.isArray(res.data) ? res.data : [])
        const backendNews = raw.map(n => ({
          id: n.id,
          category: n.category ?? "General",
          headline: n.headline ?? "Untitled",
          detail: n.details ?? "",                                  
          reporter: n.reporter ?? "Anonymous",
          date: n.dateTime ? new Date(n.dateTime).toLocaleString() 
                            : new Date().toLocaleString(),
          image: n.imagePublicUrl || n.imageUrl || "",              
          votes: {
            real: Number.isFinite(n.votesReal) ? n.votesReal : 0,   
            fake: Number.isFinite(n.votesFake) ? n.votesFake : 0    
          },
          comments: []
        }))

        const local = this.loadLocal()
        this.newsList = [...local, ...backendNews]
      } catch (err) {
        console.error("Backend not available, loading dummy data instead.", err)
        this.error = "Failed to fetch news"
        this.loadDummyNews()
      } finally {
        this.loading = false
      }
    },

    async fetchComments(newsId) {
      try {
        const res = await api.get(`/news/${newsId}/comments`, { params: { page: 0, size: 50 } })
        const page = res.data
        const comments = (page?.content || []).map(c => ({
          id: c.id,
          userId: c.userId || null,
          name: c.userName || "Anonymous",
          text: c.content || "",
          image: c.imageUrl || "",
          date: c.createdAt ? new Date(c.createdAt).toLocaleString() : ""
        }))
        return comments
      } catch (err) {
        console.error("Failed to load comments for news", newsId, err)
        return []
      }
    },

    async vote(newsId, value) {
      await api.post(`/news/${newsId}/vote`, null, { params: { value } })
    },

    async addComment(newsId, { userId, content, imageUrl = '', anonymous = false }) {
      const res = await api.post(
        `/news/${newsId}/comments`,
        null,
        { params: { userId, content, imageUrl, anonymous } }
      )
      return res.data  
    },

    async createNews(payload) {
      const res = await api.post('/news', payload)
      return res.data
    },

    async editComment(newsId, commentId, { userId, content, imageUrl = '', anonymous = false }) {
      const res = await api.put(
        `/news/${newsId}/comments/${commentId}`,
        null,
        { params: { userId, content, imageUrl, anonymous } }
      )
      return res.data
    },

    async deleteComment(newsId, commentId, userId) {
      const res = await api.delete(
        `/news/${newsId}/comments/${commentId}`,
        { params: { userId } }
      )
      return res.data
    },
  }
})
