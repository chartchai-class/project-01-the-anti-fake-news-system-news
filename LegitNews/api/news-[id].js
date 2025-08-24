import fs from "fs"
import path from "path"

const dbFile = path.join(process.cwd(), "api", "db.json")

function readDB() {
  return JSON.parse(fs.readFileSync(dbFile, "utf-8"))
}

export default function handler(req, res) {
  const { id } = req.query
  const data = readDB()
  const article = data.find(n => n.id === parseInt(id))

  if (!article) {
    return res.status(404).json({ error: "Not found" })
  }

  res.status(200).json(article)
}
