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

// Paths to db files
const dbFile = path.join(__dirname, "db.json")       // news
const usersFile = path.join(__dirname, "users.json") // users

// --- Helpers ---
function readDB() {
  const data = fs.readFileSync(dbFile, "utf-8")
  return JSON.parse(data)
}
function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2))
}

function readUsers() {
  if (!fs.existsSync(usersFile)) return []
  const data = fs.readFileSync(usersFile, "utf-8")
  return JSON.parse(data)
}
function writeUsers(data) {
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2))
}

// --- NEWS ENDPOINTS ---

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

  results = results.map(n => ({
    ...n,
    detail: n.details || n.detail || "",
    image: n.image.startsWith("http")
  ? n.image
  : `http://localhost:${PORT}/images/${n.category}/${n.image}`
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
  : `http://localhost:${PORT}/images/${article.category}/${article.image}`
  })
})

// ✅ Add a new news article
app.post("/news", (req, res) => {
  const data = readDB()
  const maxId = data.length > 0 ? Math.max(...data.map(n => n.id || 0)) : 0

  const newArticle = {
    id: maxId + 1,
    headline: req.body.headline,
    details: req.body.details || req.body.detail || "",
    reporter: req.body.reporter || "Anonymous",
    date: new Date().toLocaleString(),
    image: req.body.image || "placeholder.png",
    votes: { real: 0, fake: 0 },
    comments: []
  }

  data.push(newArticle)
  writeDB(data)

  const imageUrl = newArticle.image.startsWith("http")
    ? newArticle.image
    : `${req.protocol}://${req.get("host")}/images/${newArticle.image}`

  res.status(201).json({
    ...newArticle,
    image: imageUrl
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

// --- USERS ENDPOINTS ---

// ✅ Register new user
app.post("/register", (req, res) => {
  const users = readUsers()
  const { email, password, name } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" })
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "Email already exists" })
  }

  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1,
    email,
    password,
    name: name || "User"
  }

  users.push(newUser)
  writeUsers(users)

  res.status(201).json({ message: "User registered", user: { id: newUser.id, email: newUser.email, name: newUser.name } })
})

// ✅ Login user
app.post("/login", (req, res) => {
  const users = readUsers()
  const { email, password } = req.body

  const user = users.find(u => u.email === email && u.password === password)
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  res.json({ message: "Login successful", user: { id: user.id, email: user.email, name: user.name } })
})

// ✅ Get all users (for debugging, optional)
app.get("/users", (req, res) => {
  const users = readUsers()
  res.json(users.map(u => ({ id: u.id, email: u.email, name: u.name })))
})

// Run server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`))
