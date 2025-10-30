import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
const api = axios.create({ baseURL: `${API_BASE}/api` })

const AUTH_USER_KEY  = 'legitnews_auth_user_v1'
const AUTH_TOKEN_KEY = 'legitnews_auth_token_v1'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,  // { id, name, email, role }
    token: null
  }),
  getters: {
    isLoggedIn: (s) => !!s.token && !!s.currentUser,
    role: (s) => s.currentUser?.role?.toLowerCase() || 'guest',
    unreadCount: () => 0 // keep for UI compatibility
  },
  actions: {
    _save() {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser || null))
      sessionStorage.setItem(AUTH_TOKEN_KEY, this.token || '')
    },
    _load() {
      try {
        this.currentUser = JSON.parse(sessionStorage.getItem(AUTH_USER_KEY) || 'null')
        this.token = sessionStorage.getItem(AUTH_TOKEN_KEY) || null
        if (this.token) api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      } catch {}
    },
    init() {
      if (!this.currentUser || !this.token) this._load()
    },

    async register({ name, surname, email, password, photoUrl = '' }) {
      const res = await api.post('/auth/register', { name, surname, email, password, photoUrl })
      const d = res.data
      this.token = d.token
      this.currentUser = { id: d.id, name: d.name, email: d.email, role: d.role }
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      this._save()
    },

    async login({ email, password }) {
      const res = await api.post('/auth/login', { email, password })
      const d = res.data
      this.token = d.token
      this.currentUser = { id: d.id, name: d.name, email: d.email, role: d.role }
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      this._save()
    },

    async refreshMe() {
      if (!this.currentUser?.id) return
      const res = await api.get(`/users/${this.currentUser.id}`)
      // Expect { id, name, email, role, membershipRequested, ... }
      const d = res.data
      this.currentUser = { ...this.currentUser, ...d }
      this._save()
    },

    async applyForMembership() {
      if (!this.currentUser?.id) { alert('Please log in first.'); return }
      await api.post(`/users/${this.currentUser.id}/membership/request`)
      await this.refreshMe()
      alert('✅ Your membership request has been submitted.')
    },

    async checkMembershipStatus() {
      if (!this.isLoggedIn) return;
      try {
        const res = await api.get(`/users/${this.currentUser.id}`);
        const newRole = res.data.role?.toLowerCase();
        if (newRole && newRole !== this.currentUser.role) {
          this.currentUser.role = newRole;
          this._save();
          if (newRole === 'member') {
            alert('🎉 Your membership request has been approved!');
          }
        }
      } catch (err) {
        console.warn('Membership check failed', err);
      }
    },

    logout() {
      this.currentUser = null
      this.token = null
      delete api.defaults.headers.common['Authorization']
      sessionStorage.removeItem(AUTH_USER_KEY)
      sessionStorage.removeItem(AUTH_TOKEN_KEY)
    }
  }
})
