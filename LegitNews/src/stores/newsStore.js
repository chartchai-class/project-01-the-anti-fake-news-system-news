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
          hidden: !!n.hidden,
          views: n.views ?? 0,
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

    // --- ADMIN: fetch reported comments ---
    async fetchAdminReportedComments({ page = 0, size = 50 } = {}) {
      const tryPaths = [
        '/admin/reported-comments',
        '/admin/comments/reported',
        '/admin/reports'
      ]
      for (const p of tryPaths) {
        try {
          const res = await api.get(p, { params: { page, size } })
          const src = Array.isArray(res.data?.content) ? res.data.content
                  : (Array.isArray(res.data) ? res.data : [])
          return src.map(dto => ({
            id: dto.id,
            newsId: dto.newsId ?? dto.news?.id,
            content: dto.content ?? '',
            author: dto.authorName ?? dto.author ?? 'Anonymous',
            article: dto.newsHeadline ?? dto.article ?? dto.news?.headline ?? 'Unknown',
            date: dto.createdAt ? new Date(dto.createdAt).toLocaleString() : (dto.date ?? ''),
            reports: dto.reports ?? dto.reportsCount ?? 0,
          }))
        } catch (e) {
          // try next path
        }
      }
      console.warn('No admin reported-comments endpoint responded.')
      return []
    },

    // --- ADMIN: fetch deleted comments (history) ---
    async fetchAdminDeletedComments({ page = 0, size = 50 } = {}) {
      const tryPaths = [
        '/admin/deleted-comments',
        '/admin/comments/deleted',
      ]
      for (const p of tryPaths) {
        try {
          const res = await api.get(p, { params: { page, size } })
          const src = Array.isArray(res.data?.content) ? res.data.content
                  : (Array.isArray(res.data) ? res.data : [])
          return src.map(dto => ({
            id: dto.id,
            newsId: dto.newsId ?? dto.news?.id,
            // ⚠️ use contentSnapshot as the comment content for deleted items
            content: dto.contentSnapshot ?? dto.content ?? '',
            author: dto.authorName ?? dto.author ?? 'Anonymous',
            article: dto.newsHeadline ?? dto.article ?? dto.news?.headline ?? 'Unknown',
            deletedBy: dto.deletedBy ?? 'Admin',
            deletedDate: dto.deletedAt
              ? new Date(dto.deletedAt).toLocaleString()
              : (dto.deletedDate ?? '')
            // reason removed (no longer needed by UI)
          }))
        } catch (e) {
          // try next path
        }
      }
      console.warn('No admin deleted-comments endpoint responded.')
      return []
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

    async reportComment(newsId, commentId, { reason = '' } = {}) {
    await api.post(`/news/${newsId}/comments/${commentId}/report`, null, {
        params: { reason }
      })
    },

    // Admin deletes a comment and writes history
    async adminDeleteComment(newsId, commentId, { reason = '' } = {}) {
      await api.delete(`/admin/comments/${commentId}`, { params: { reason } })
    },

    async fetchAdminNews({ status = 'active', page = 0, size = 50 } = {}) {
      const res = await api.get('/admin/news', { params: { status, page, size } })
      const pageData = res.data
      const list = Array.isArray(pageData?.content) ? pageData.content : []

      return list.map(n => {
        const votesReal =
          Number(n.votesReal ?? n.votes_real ?? n?.votes?.real ?? 0) || 0
        const votesFake =
          Number(n.votesFake ?? n.votes_fake ?? n?.votes?.fake ?? 0) || 0

        return {
          id: n.id,
          title: n.headline ?? 'Untitled',
          author: n.reporter ?? 'Anonymous',
          submittedBy: n.createdByName || 'System',
          category: n.category ?? 'General',
          date: n.dateTime ? new Date(n.dateTime).toLocaleString() : '',
          votesReal,
          votesFake,
          votes: { real: votesReal, fake: votesFake },
          status: (votesReal > votesFake) ? 'Verified' : 'Fake',
          views: n.views ?? 0,
          hidden: !!n.hidden
        }
      })
    },


    async adminHideNews(id) {
      await api.patch(`/admin/news/${id}/hide`)
    },
    async adminRestoreNews(id) {
      await api.patch(`/admin/news/${id}/restore`)
    }


  }
})
