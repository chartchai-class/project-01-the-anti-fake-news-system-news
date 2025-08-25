import fs from "fs"
import path from "path"

const dbFile = path.join(process.cwd(), "db.json")

function readDB() {
  if (!fs.existsSync(dbFile)) return []
  return JSON.parse(fs.readFileSync(dbFile, "utf-8"))
}

function normalizeCategory(cat = "General") {
  return cat.toLowerCase(); // "Business News" -> "business news"
}

export default function handler(req, res) {
  if (req.method === "GET") {
    let results = readDB()
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || results.length

    // normalize each article
    results = results.map(n => ({
      id: n.id,
      category: n.category || "General",
      headline: n.headline || n.title || "Untitled",
      detail: n.details || n.detail || "",
      reporter: n.reporter || "Anonymous",
      date: n.date || new Date().toLocaleString(),
      image: (n.image || "").startsWith("http")
        ? n.image
        : `/images/${encodeURIComponent(n.category)}/${n.image}`,
      votes: n.votes || { real: 0, fake: 0 },
      comments: n.comments || []
    }))

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginated = results.slice(startIndex, endIndex)

    res.status(200).json({
      total: results.length,
      page,
      limit,
      data: paginated
    })
  } else {
    res.setHeader("Allow", ["GET"])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
