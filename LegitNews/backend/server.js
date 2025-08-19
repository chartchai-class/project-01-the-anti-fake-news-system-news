const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Mock DB (in-memory for now)
let news = [
  {
    id: 1,
    headline: "New Vaccine Released",
    detail: "The new vaccine for XYZ has been approved and distributed across major hospitals.",
    reporter: "Dr. Aung",
    date: "2025-08-17 12:00",
    image: "https://via.placeholder.com/150",
    votes: { real: 10, fake: 2 },
    comments: []
  },
  {
    id: 2,
    headline: "Floods Hit Yangon",
    detail: "Heavy rains have caused flooding in several downtown areas, displacing hundreds of families.",
    reporter: "Reporter Khin",
    date: "2025-08-16 08:30",
    image: "https://via.placeholder.com/150",
    votes: { real: 14, fake: 1 },
    comments: []
  },
  {
    id: 3,
    headline: "Tech Giant Launches AI Tool",
    detail: "A leading tech company has introduced a new AI-powered platform for businesses.",
    reporter: "Anonymous",
    date: "2025-08-15 15:00",
    image: "https://via.placeholder.com/150",
    votes: { real: 7, fake: 5 },
    comments: []
  },
  {
    id: 4,
    headline: "New Highway Opens",
    detail: "The new highway connecting Mandalay to Naypyidaw has officially opened.",
    reporter: "Reporter Min",
    date: "2025-08-14 09:45",
    image: "https://via.placeholder.com/150",
    votes: { real: 20, fake: 3 },
    comments: []
  },
  {
    id: 5,
    headline: "Power Outage in Bago",
    detail: "Residents faced a massive power outage last night due to maintenance issues.",
    reporter: "Reporter Su",
    date: "2025-08-13 22:10",
    image: "https://via.placeholder.com/150",
    votes: { real: 5, fake: 4 },
    comments: []
  },
  {
    id: 6,
    headline: "Rare Bird Spotted",
    detail: "A rare species of bird was spotted in the forests of Shan State.",
    reporter: "Reporter Lin",
    date: "2025-08-12 11:20",
    image: "https://via.placeholder.com/150",
    votes: { real: 12, fake: 2 },
    comments: []
  },
  {
    id: 7,
    headline: "Gold Prices Soar",
    detail: "Gold prices have reached an all-time high in Yangon markets.",
    reporter: "Reporter Aye",
    date: "2025-08-11 14:00",
    image: "https://via.placeholder.com/150",
    votes: { real: 18, fake: 1 },
    comments: []
  },
  {
    id: 8,
    headline: "Local Startup Raises Funds",
    detail: "A Yangon-based startup has raised $5 million in its latest funding round.",
    reporter: "Anonymous",
    date: "2025-08-10 10:00",
    image: "https://via.placeholder.com/150",
    votes: { real: 9, fake: 3 },
    comments: []
  },
  {
    id: 9,
    headline: "School Exams Postponed",
    detail: "National exams have been postponed due to heavy rainfall across the country.",
    reporter: "Reporter Hla",
    date: "2025-08-09 07:30",
    image: "https://via.placeholder.com/150",
    votes: { real: 16, fake: 2 },
    comments: []
  },
  {
    id: 10,
    headline: "New Smartphone Released",
    detail: "A new smartphone model has hit the market with improved battery life.",
    reporter: "Reporter Kyaw",
    date: "2025-08-08 16:15",
    image: "https://via.placeholder.com/150",
    votes: { real: 8, fake: 6 },
    comments: []
  },
  {
    id: 11,
    headline: "Fuel Prices Drop",
    detail: "The government has announced a decrease in fuel prices starting this week.",
    reporter: "Reporter Moe",
    date: "2025-08-07 13:45",
    image: "https://via.placeholder.com/150",
    votes: { real: 15, fake: 1 },
    comments: []
  },
  {
    id: 12,
    headline: "Sports Festival Announced",
    detail: "The annual national sports festival will be held in Mandalay this September.",
    reporter: "Reporter Tun",
    date: "2025-08-06 09:20",
    image: "https://via.placeholder.com/150",
    votes: { real: 13, fake: 2 },
    comments: []
  },
  {
    id: 13,
    headline: "New Mall Opens",
    detail: "A new shopping mall with international brands has opened in downtown Yangon.",
    reporter: "Reporter Phyo",
    date: "2025-08-05 18:30",
    image: "https://via.placeholder.com/150",
    votes: { real: 17, fake: 3 },
    comments: []
  },
  {
    id: 14,
    headline: "Myanmar Team Wins Match",
    detail: "The national football team secured a 2-1 victory against Thailand.",
    reporter: "Reporter Zaw",
    date: "2025-08-04 20:00",
    image: "https://via.placeholder.com/150",
    votes: { real: 22, fake: 0 },
    comments: []
  },
  {
    id: 15,
    headline: "Bridge Repair Completed",
    detail: "The old bridge over the Irrawaddy has been repaired and reopened for traffic.",
    reporter: "Anonymous",
    date: "2025-08-03 17:15",
    image: "https://via.placeholder.com/150",
    votes: { real: 10, fake: 2 },
    comments: []
  },
  {
    id: 16,
    headline: "New University Courses",
    detail: "Universities are introducing new IT and AI courses for the upcoming semester.",
    reporter: "Reporter Nyein",
    date: "2025-08-02 08:50",
    image: "https://via.placeholder.com/150",
    votes: { real: 14, fake: 1 },
    comments: []
  },
  {
    id: 17,
    headline: "Traffic Jam in Downtown",
    detail: "Major traffic jams occurred today in downtown Yangon during rush hours.",
    reporter: "Reporter Thura",
    date: "2025-08-01 07:40",
    image: "https://via.placeholder.com/150",
    votes: { real: 11, fake: 4 },
    comments: []
  },
  {
    id: 18,
    headline: "Farmers Protest Prices",
    detail: "Farmers gathered to protest low crop prices in rural areas of Magway.",
    reporter: "Reporter Win",
    date: "2025-07-31 15:10",
    image: "https://via.placeholder.com/150",
    votes: { real: 12, fake: 5 },
    comments: []
  },
  {
    id: 19,
    headline: "Tourism Rising Again",
    detail: "Tourist numbers have been increasing steadily in Bagan since last year.",
    reporter: "Reporter Ei",
    date: "2025-07-30 12:00",
    image: "https://via.placeholder.com/150",
    votes: { real: 19, fake: 2 },
    comments: []
  },
  {
    id: 20,
    headline: "New Hospital Opens",
    detail: "A new hospital with advanced medical equipment has opened in Naypyidaw.",
    reporter: "Reporter Myint",
    date: "2025-07-29 09:25",
    image: "https://via.placeholder.com/150",
    votes: { real: 20, fake: 1 },
    comments: []
  }
]

// ✅ Get all news (with filtering + pagination)
app.get("/news", (req, res) => {
  const search = req.query.search ? req.query.search.toLowerCase() : null
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || news.length // default = return all

  let results = news

  // 🔎 Filter by search keyword
  if (search) {
    results = results.filter(n =>
      n.headline.toLowerCase().includes(search) ||
      n.detail.toLowerCase().includes(search) ||
      n.reporter.toLowerCase().includes(search)
    )
  }

  // 📑 Pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginated = results.slice(startIndex, endIndex)

  res.json({
    total: results.length,
    page,
    limit,
    data: paginated
  })
})

// ✅ Get single news by ID
app.get("/news/:id", (req, res) => {
  const article = news.find(n => n.id === parseInt(req.params.id))
  article ? res.json(article) : res.status(404).json({ error: "Not found" })
})

// ✅ Add a new news article
app.post("/news", (req, res) => {
  const newArticle = {
    id: news.length + 1,
    headline: req.body.headline,
    detail: req.body.detail,
    reporter: req.body.reporter || "Anonymous",
    date: new Date().toLocaleString(),
    image: req.body.image || "https://via.placeholder.com/150",
    votes: { real: 0, fake: 0 },
    comments: []
  }
  news.push(newArticle)
  res.status(201).json(newArticle)
})

// ✅ Add a comment to an article
app.post("/news/:id/comments", (req, res) => {
  const article = news.find(n => n.id === parseInt(req.params.id))
  if (!article) return res.status(404).json({ error: "News not found" })

  const comment = {
    id: article.comments.length + 1,
    text: req.body.text,
    image: req.body.image || null,
    user: req.body.user || "Guest",
    date: new Date().toLocaleString()
  }
  article.comments.push(comment)
  res.status(201).json(comment)
})

// ✅ Vote on news
app.post("/news/:id/vote", (req, res) => {
  const article = news.find(n => n.id === parseInt(req.params.id))
  if (!article) return res.status(404).json({ error: "News not found" })

  if (req.body.vote === "real") article.votes.real++
  else if (req.body.vote === "fake") article.votes.fake++

  res.json(article.votes)
})

// Run server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`))
