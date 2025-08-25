// src/stores/newsStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api"  
  // ✅ fallback to /api on Vercel
})

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
    // ✅ LocalStorage helpers
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

    // ✅ Add News (frontend only, persists in localStorage)
    addNews(news) {
      this.newsList.unshift(news)

      const local = this.loadLocal()
      local.unshift(news)
      this.saveLocal(local)
    },

    // ✅ Dummy Data
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

    // ✅ Fetch backend + merge localStorage
    async fetchNews() {
      this.loading = true
      this.error = null
      try {
        const res = await api.get("/news", { params: { page: 1, limit: 1000 } })
        const backendNews = res.data.data || res.data

        // Merge with localStorage (local comes first)
        const local = this.loadLocal()
        this.newsList = [...local, ...backendNews]
      } catch (err) {
        console.error("Backend not available, loading dummy data instead.", err)
        this.error = "Failed to fetch news"
        this.loadDummyNews()
      } finally {
        this.loading = false
      }
    }
  }
})
