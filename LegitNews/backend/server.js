// server.js
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const fs = require("fs")
const path = require("path")

const app = express()
app.use(cors())
app.use(bodyParser.json())

// ✅ Serve static images folder
app.use("/images", express.static(path.join(process.cwd(), "images")))

// Path to db.json
const dbFile = path.join(__dirname, "db.json")

// --- Helpers ---
function readDB() {
  const data = fs.readFileSync(dbFile, "utf-8")
  return JSON.parse(data) // returns an array
}

function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2))
}

// --- Endpoints ---

// ✅ Get all news (with optional search + pagination)
app.get("/news", (req, res) => {
  let results = readDB()
  const search = req.query.search ? req.query.search.toLowerCase() : null
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || results.length

  if (search) {
    results = results.filter(n =>
      n.headline.toLowerCase().includes(search) ||
      (n.details || "").toLowerCase().includes(search) ||
      (n.reporter || "").toLowerCase().includes(search)
    )
  }

  // Normalize: add `detail` + full image URL
  results = results.map(n => ({
    ...n,
    detail: n.details || n.detail || "",
    image: n.image.startsWith("http")
      ? n.image
      : `http://localhost:${PORT}/images/${n.image}`
  }))

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
  const data = readDB()
  const article = data.find(n => n.id === parseInt(req.params.id))
  if (!article) return res.status(404).json({ error: "Not found" })

  res.json({
    ...article,
    detail: article.details || article.detail || "",
    image: article.image.startsWith("http")
      ? article.image
      : `http://localhost:${PORT}/images/${article.image}`
  })
})

// ✅ Add a new news article
app.post("/news", (req, res) => {
  const data = readDB()

  const newArticle = {
    id: data.length ? data[data.length - 1].id + 1 : 1,
    headline: req.body.headline,
    details: req.body.details || req.body.detail || "",
    reporter: req.body.reporter || "Anonymous",
    date: new Date().toLocaleString(),
    image: req.body.image || "placeholder.png", // just filename
    votes: { real: 0, fake: 0 },
    comments: []
  }

  data.push(newArticle)
  writeDB(data)

  res.status(201).json({
    ...newArticle,
    image: newArticle.image.startsWith("http")
      ? newArticle.image
      : `http://localhost:${PORT}/images/${newArticle.image}`
  })
})

// ✅ Add a comment
app.post("/news/:id/comments", (req, res) => {
  const data = readDB()
  const article = data.find(n => n.id === parseInt(req.params.id))
  if (!article) return res.status(404).json({ error: "News not found" })

  const comment = {
    id: article.comments.length + 1,
    text: req.body.text,
    user: req.body.user || "Guest",
    date: new Date().toLocaleString()
  }

  article.comments.push(comment)
  writeDB(data)

  res.status(201).json(comment)
})

// ✅ Vote
app.post("/news/:id/vote", (req, res) => {
  const data = readDB()
  const article = data.find(n => n.id === parseInt(req.params.id))
  if (!article) return res.status(404).json({ error: "News not found" })

  if (req.body.vote === "real") article.votes.real++
  else if (req.body.vote === "fake") article.votes.fake++

  writeDB(data)
  res.json(article.votes)
})

// Run server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`))
