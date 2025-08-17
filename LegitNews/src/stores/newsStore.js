import { defineStore } from 'pinia'

export const useNewsStore = defineStore('news', {
  state: () => ({
    newsList: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      headline: `Sample Headline ${i + 1}`,
      detail: `This is the full detail for news item ${i + 1}. It provides a longer description about the event.`,
      reporter: i % 3 === 0 ? "Anonymous" : `Reporter ${i + 1}`,
      date: `2025-08-17 ${10 + (i % 12)}:00`,
      image: "https://via.placeholder.com/150",
      votes: { real: Math.floor(Math.random() * 20), fake: Math.floor(Math.random() * 20) }
    }))
  }),
  getters: {
    allNews: (state) => state.newsList,
  }
})
