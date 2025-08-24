import fs from "fs"
import path from "path"

const dbFile = path.join(process.cwd(), "api", "db.json")

function readDB() {
  const data = fs.readFileSync(dbFile, "utf-8")
  return JSON.parse(data)
}
function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2))
}

export default function handler(req, res) {
  if (req.method === "GET") {
    let results = readDB()
    const search = req.query.search ? req.query.search.toLowerCase() : null
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || results.length

    if (search) {
      results = results.filter(n =>
        (n.headline || "").toLowerCase().includes(search) ||
        (n.detail || "").toLowerCase().includes(search) ||
        (n.reporter || "").toLowerCase().includes(search)
      )
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginated = results.slice(startIndex, endIndex)

    res.status(200).json({
      total: results.length,
      page,
      limit,
      data: paginated
    })
  }

  else if (req.method === "POST") {
    const data = readDB()
    const maxId = data.length > 0 ? Math.max(...data.map(n => n.id || 0)) : 0

    const newArticle = {
      id: maxId + 1,
      category: req.body.category || "General",
      headline: req.body.headline || "",
      detail: req.body.detail || "",
      reporter: req.body.reporter || "Anonymous",
      date: new Date().toLocaleString(),
      image: req.body.image || "placeholder.png",
      votes: { real: 0, fake: 0 },
      comments: []
    }

    data.push(newArticle)
    writeDB(data)

    res.status(201).json(newArticle)
  }

  else {
    res.setHeader("Allow", ["GET", "POST"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
