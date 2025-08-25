import fs from "fs"
import path from "path"

const dbFile = path.join(process.cwd(), "db.json")
function readDB() {
  if (!fs.existsSync(dbFile)) return []
  return JSON.parse(fs.readFileSync(dbFile, "utf-8"))
}

export default function handler(req, res) {
  const { id } = req.query
  if (req.method === "GET") {
    const data = readDB()
    const article = data.find(n => n.id === parseInt(id))
    if (!article) return res.status(404).json({ error: "Not found" })

    return res.json({
      id: article.id,
      category: article.category || "General",
      headline: article.headline || article.title || "Untitled",
      detail: article.details || article.detail || "",
      reporter: article.reporter || "Anonymous",
      date: article.date || new Date().toLocaleString(),
      image: (article.image || "").startsWith("http")
        ? article.image
        : `/images/${encodeURIComponent((article.category || "").toLowerCase())}/${article.image}`,
      votes: article.votes || { real: 0, fake: 0 },
      comments: article.comments || []
    })
  }

  res.setHeader("Allow", ["GET"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
