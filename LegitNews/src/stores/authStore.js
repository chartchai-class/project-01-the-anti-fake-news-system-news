// Pinia store for simple auth (localStorage, string-compare)
import { defineStore } from 'pinia'

const AUTH_KEY = 'legitnews_auth_v1'
const USERS_KEY = 'legitnews_users_v1'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,   // { id, name, surname, email, photoUrl, membership, notifications? }
    users: [],           // demo user storage (local only)
  }),
  getters: {
    isLoggedIn: (s) => !!s.currentUser,
    unreadCount: (s) => s.currentUser?.notifications ?? 0,
    role: (s) => s.currentUser?.membership ?? 'guest',
  },
  actions: {
    _save() {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ currentUser: this.currentUser }))
      localStorage.setItem(USERS_KEY, JSON.stringify(this.users))
    },
    _load() {
      try {
        const a = JSON.parse(localStorage.getItem(AUTH_KEY) || '{}')
        const u = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
        this.currentUser = a.currentUser || null
        this.users = Array.isArray(u) ? u : []
      } catch {/* ignore */}
    },
    init() {
      if (!this.users.length && this.currentUser == null) this._load()
      if (!this.users.length) {
        // seed one admin (optional; delete if you don't want this)
        this.users.push({
          id: 1,
          name: 'Admin',
          surname: 'User',
          email: 'admin@legit.news',
          password: 'admin',
          photoUrl: '',
          membership: 'administrator',
        })
        this._save()
      }
    },
    register({ name, surname, email, password, photoUrl = '' }) {
      if (this.users.find(u => u.email === email)) throw new Error('Email already registered')
      const newUser = {
        id: Date.now(), name, surname, email, password, photoUrl, membership: 'reader'
      }
      this.users.push(newUser)
      this.currentUser = { ...newUser, password: undefined, notifications: 0 }
      this._save()
    },
    login({ email, password }) {
      const user = this.users.find(u => u.email === email && u.password === password)
      if (!user) throw new Error('Invalid credentials')
      this.currentUser = { ...user, password: undefined, notifications: this.currentUser?.notifications ?? 0 }
      this._save()
    },
    logout() { this.currentUser = null; this._save() },
    addNotification(n = 1) {
      if (!this.currentUser) return
      this.currentUser.notifications = (this.currentUser.notifications ?? 0) + n
      this._save()
    },
    markNotificationsRead() {
      if (!this.currentUser) return
      this.currentUser.notifications = 0
      this._save()
    },
    applyForMembership() { return true }
  }
})
