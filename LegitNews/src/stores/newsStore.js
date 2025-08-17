// src/stores/newsStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

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
    // Fallback dummy data
    loadDummyNews() {
      this.newsList = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        headline: `Sample Headline ${i + 1}`,
        detail: `This is the full detail for news item ${i + 1}. It provides a longer description about the event.`,
        reporter: i % 3 === 0 ? "Anonymous" : `Reporter ${i + 1}`,
        date: `2025-08-17 ${10 + (i % 12)}:00`,
        image: "https://via.placeholder.com/150",
        votes: { real: Math.floor(Math.random() * 20), fake: Math.floor(Math.random() * 20) }
      }))
    },

    // Fetch ALL news from backend (no pagination at backend side)
    async fetchNews() {
      this.loading = true
      this.error = null
      try {
        const res = await axios.get("http://localhost:5000/news", {
          params: { page: 1, limit: 1000 }   // ✅ fetch all in one go
        })
        // backend returns { data, total, page, limit }
        this.newsList = res.data.data || res.data
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
